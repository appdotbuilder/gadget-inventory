import { db } from '../db';
import { notificationsTable, assetsTable } from '../db/schema';
import { type Notification } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getNotifications(): Promise<Notification[]> {
  try {
    // Fetch all notifications ordered by created_at DESC to show newest first
    const results = await db.select()
      .from(notificationsTable)
      .orderBy(desc(notificationsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  try {
    // Fetch only unread notifications ordered by created_at DESC
    const results = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.is_read, false))
      .orderBy(desc(notificationsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch unread notifications:', error);
    throw error;
  }
}

export async function markNotificationAsRead(id: number): Promise<{ success: boolean }> {
  try {
    // Update the specific notification to mark as read
    const result = await db.update(notificationsTable)
      .set({ is_read: true })
      .where(eq(notificationsTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

export async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
  try {
    // Update all unread notifications to read status
    const result = await db.update(notificationsTable)
      .set({ is_read: true })
      .where(eq(notificationsTable.is_read, false))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
}