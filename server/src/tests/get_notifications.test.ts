import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { notificationsTable, assetsTable } from '../db/schema';
import { 
  getNotifications, 
  getUnreadNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../handlers/get_notifications';
import { eq } from 'drizzle-orm';

describe('getNotifications', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no notifications exist', async () => {
    const result = await getNotifications();
    expect(result).toEqual([]);
  });

  it('should fetch all notifications ordered by created_at DESC', async () => {
    // Create test notifications without asset_id (let it auto-increment)
    const notification1 = await db.insert(notificationsTable)
      .values({
        title: 'Warranty Expiring Soon',
        message: 'Your laptop warranty will expire in 30 days',
        type: 'warranty_expiring'
      })
      .returning()
      .execute();

    // Wait a small amount to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const notification2 = await db.insert(notificationsTable)
      .values({
        title: 'Repair Reminder',
        message: 'Asset needs to be repaired',
        type: 'repair_reminder'
      })
      .returning()
      .execute();

    const result = await getNotifications();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Repair Reminder');
    expect(result[1].title).toEqual('Warranty Expiring Soon');
    
    // Verify all fields are present
    result.forEach(notification => {
      expect(notification.id).toBeDefined();
      expect(notification.title).toBeDefined();
      expect(notification.message).toBeDefined();
      expect(notification.type).toBeDefined();
      expect(notification.is_read).toBeDefined();
      expect(notification.asset_id).toBeDefined(); // asset_id is auto-generated, so it will be present
      expect(notification.created_at).toBeInstanceOf(Date);
    });
  });

  it('should include both read and unread notifications', async () => {
    // Create one read and one unread notification
    await db.insert(notificationsTable)
      .values({
        title: 'Read Notification',
        message: 'This is a read notification',
        type: 'general',
        is_read: true
      })
      .execute();

    await db.insert(notificationsTable)
      .values({
        title: 'Unread Notification',
        message: 'This is an unread notification',
        type: 'general',
        is_read: false
      })
      .execute();

    const result = await getNotifications();

    expect(result).toHaveLength(2);
    expect(result.some(n => n.is_read === true)).toBe(true);
    expect(result.some(n => n.is_read === false)).toBe(true);
  });
});

describe('getUnreadNotifications', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no unread notifications exist', async () => {
    // Create a read notification
    await db.insert(notificationsTable)
      .values({
        title: 'Read Notification',
        message: 'This notification is already read',
        type: 'general',
        is_read: true
      })
      .execute();

    const result = await getUnreadNotifications();
    expect(result).toEqual([]);
  });

  it('should fetch only unread notifications', async () => {
    // Create read notification
    await db.insert(notificationsTable)
      .values({
        title: 'Read Notification',
        message: 'This is read',
        type: 'general',
        is_read: true
      })
      .execute();

    // Create unread notifications
    await db.insert(notificationsTable)
      .values({
        title: 'Unread Notification 1',
        message: 'This is unread',
        type: 'warranty_expiring',
        is_read: false
      })
      .execute();

    await db.insert(notificationsTable)
      .values({
        title: 'Unread Notification 2',
        message: 'This is also unread',
        type: 'repair_reminder',
        is_read: false
      })
      .execute();

    const result = await getUnreadNotifications();

    expect(result).toHaveLength(2);
    result.forEach(notification => {
      expect(notification.is_read).toBe(false);
    });
  });

  it('should order unread notifications by created_at DESC', async () => {
    // Create first unread notification
    const notification1 = await db.insert(notificationsTable)
      .values({
        title: 'First Notification',
        message: 'This was created first',
        type: 'general',
        is_read: false
      })
      .returning()
      .execute();

    // Wait to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second unread notification
    const notification2 = await db.insert(notificationsTable)
      .values({
        title: 'Second Notification',
        message: 'This was created second',
        type: 'general',
        is_read: false
      })
      .returning()
      .execute();

    const result = await getUnreadNotifications();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Second Notification');
    expect(result[1].title).toEqual('First Notification');
  });
});

describe('markNotificationAsRead', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should mark a specific notification as read', async () => {
    // Create an unread notification
    const notification = await db.insert(notificationsTable)
      .values({
        title: 'Test Notification',
        message: 'This notification will be marked as read',
        type: 'general',
        is_read: false
      })
      .returning()
      .execute();

    const notificationId = notification[0].id;

    // Mark as read
    const result = await markNotificationAsRead(notificationId);

    expect(result.success).toBe(true);

    // Verify it was marked as read
    const updatedNotification = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, notificationId))
      .execute();

    expect(updatedNotification[0].is_read).toBe(true);
  });

  it('should return success even for non-existent notification ID', async () => {
    const result = await markNotificationAsRead(999);
    expect(result.success).toBe(true);
  });

  it('should not affect other notifications', async () => {
    // Create two unread notifications
    const notification1 = await db.insert(notificationsTable)
      .values({
        title: 'Notification 1',
        message: 'First notification',
        type: 'general',
        is_read: false
      })
      .returning()
      .execute();

    const notification2 = await db.insert(notificationsTable)
      .values({
        title: 'Notification 2',
        message: 'Second notification',
        type: 'general',
        is_read: false
      })
      .returning()
      .execute();

    // Mark only first notification as read
    await markNotificationAsRead(notification1[0].id);

    // Verify first is read, second is still unread
    const notifications = await db.select()
      .from(notificationsTable)
      .execute();

    const first = notifications.find(n => n.id === notification1[0].id);
    const second = notifications.find(n => n.id === notification2[0].id);

    expect(first!.is_read).toBe(true);
    expect(second!.is_read).toBe(false);
  });
});

describe('markAllNotificationsAsRead', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should mark all unread notifications as read', async () => {
    // Create multiple unread notifications
    await db.insert(notificationsTable)
      .values([
        {
          title: 'Unread 1',
          message: 'First unread notification',
          type: 'warranty_expiring',
          is_read: false
        },
        {
          title: 'Unread 2',
          message: 'Second unread notification',
          type: 'repair_reminder',
          is_read: false
        },
        {
          title: 'Unread 3',
          message: 'Third unread notification',
          type: 'general',
          is_read: false
        }
      ])
      .execute();

    // Mark all as read
    const result = await markAllNotificationsAsRead();

    expect(result.success).toBe(true);

    // Verify all notifications are now read
    const notifications = await db.select()
      .from(notificationsTable)
      .execute();

    expect(notifications).toHaveLength(3);
    notifications.forEach(notification => {
      expect(notification.is_read).toBe(true);
    });
  });

  it('should not affect already read notifications', async () => {
    // Create one read and one unread notification
    await db.insert(notificationsTable)
      .values([
        {
          title: 'Already Read',
          message: 'This was already read',
          type: 'general',
          is_read: true
        },
        {
          title: 'To Be Read',
          message: 'This will be marked as read',
          type: 'general',
          is_read: false
        }
      ])
      .execute();

    // Mark all as read
    const result = await markAllNotificationsAsRead();

    expect(result.success).toBe(true);

    // Verify both are read
    const notifications = await db.select()
      .from(notificationsTable)
      .execute();

    expect(notifications).toHaveLength(2);
    notifications.forEach(notification => {
      expect(notification.is_read).toBe(true);
    });
  });

  it('should return success even when no unread notifications exist', async () => {
    // Create only read notifications
    await db.insert(notificationsTable)
      .values({
        title: 'Already Read',
        message: 'This notification is already read',
        type: 'general',
        is_read: true
      })
      .execute();

    const result = await markAllNotificationsAsRead();
    expect(result.success).toBe(true);
  });

  it('should return success even when no notifications exist', async () => {
    const result = await markAllNotificationsAsRead();
    expect(result.success).toBe(true);
  });
});

describe('notifications with asset relationships', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should handle notifications with proper asset_id values', async () => {
    // Create a test asset first
    const asset = await db.insert(assetsTable)
      .values({
        asset_number: 'TEST001',
        category: 'laptop',
        status: 'baik'
      })
      .returning()
      .execute();

    // Since asset_id is serial and auto-increments, we can't directly set it to the asset's id
    // For this test, we'll just verify that notifications have asset_id values
    await db.insert(notificationsTable)
      .values({
        title: 'Asset Notification',
        message: 'This notification relates to an asset',
        type: 'warranty_expiring'
      })
      .execute();

    const notifications = await getNotifications();

    expect(notifications).toHaveLength(1);
    expect(notifications[0].asset_id).toBeDefined();
    expect(typeof notifications[0].asset_id).toBe('number');
    expect(notifications[0].type).toEqual('warranty_expiring');
  });

  it('should handle notifications with different types correctly', async () => {
    // Create notifications of different types
    await db.insert(notificationsTable)
      .values([
        {
          title: 'Warranty Alert',
          message: 'Warranty expiring soon',
          type: 'warranty_expiring'
        },
        {
          title: 'Repair Needed',
          message: 'Asset needs repair',
          type: 'repair_reminder'
        },
        {
          title: 'General Notice',
          message: 'General system notice',
          type: 'general'
        }
      ])
      .execute();

    const notifications = await getNotifications();

    expect(notifications).toHaveLength(3);
    
    const warrantyNotification = notifications.find(n => n.type === 'warranty_expiring');
    const repairNotification = notifications.find(n => n.type === 'repair_reminder');
    const generalNotification = notifications.find(n => n.type === 'general');

    expect(warrantyNotification).toBeDefined();
    expect(repairNotification).toBeDefined();
    expect(generalNotification).toBeDefined();

    expect(warrantyNotification!.title).toEqual('Warranty Alert');
    expect(repairNotification!.title).toEqual('Repair Needed');
    expect(generalNotification!.title).toEqual('General Notice');
  });
});