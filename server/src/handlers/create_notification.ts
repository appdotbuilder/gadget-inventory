import { db } from '../db';
import { notificationsTable, assetsTable } from '../db/schema';
import { type CreateNotificationInput, type Notification } from '../schema';
import { eq, and, isNull, sql, inArray, isNotNull } from 'drizzle-orm';

export async function createNotification(input: CreateNotificationInput): Promise<Notification> {
  try {
    // Note: Due to the database schema constraint, asset_id cannot be null
    // If input.asset_id is null, we need to handle this case appropriately
    if (input.asset_id === null) {
      // For now, we'll reject null asset_id since the schema doesn't support it
      throw new Error('asset_id cannot be null due to database schema constraints');
    }

    // Insert notification record
    const result = await db.insert(notificationsTable)
      .values({
        title: input.title,
        message: input.message,
        type: input.type,
        asset_id: input.asset_id,
        is_read: false
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Notification creation failed:', error);
    throw error;
  }
}

export async function generateWarrantyNotifications(): Promise<{ created: number }> {
  try {
    // Calculate date 30 days from now
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysDate = thirtyDaysFromNow.toISOString().split('T')[0]; // YYYY-MM-DD format

    const currentDate = new Date().toISOString().split('T')[0];

    // Find assets with warranty expiring within 30 days
    // Using proper text date comparison since warranty_date is stored as text
    const assetsExpiring = await db.select()
      .from(assetsTable)
      .where(
        and(
          isNotNull(assetsTable.warranty_date),
          sql`${assetsTable.warranty_date} <= ${thirtyDaysDate}`,
          sql`${assetsTable.warranty_date} >= ${currentDate}`
        )
      )
      .execute();

    if (assetsExpiring.length === 0) {
      return { created: 0 };
    }

    // Get existing warranty notifications for these assets to avoid duplicates
    const assetIds = assetsExpiring.map(a => a.id);
    
    let existingNotifications: any[] = [];
    if (assetIds.length > 0) {
      existingNotifications = await db.select()
        .from(notificationsTable)
        .where(
          and(
            eq(notificationsTable.type, 'warranty_expiring'),
            inArray(notificationsTable.asset_id, assetIds)
          )
        )
        .execute();
    }

    const existingAssetIds = new Set(existingNotifications.map(n => n.asset_id));

    // Create notifications for assets that don't already have warranty notifications
    const notificationsToCreate = assetsExpiring
      .filter(asset => !existingAssetIds.has(asset.id))
      .map(asset => ({
        title: 'Warranty Expiring Soon',
        message: `Asset ${asset.asset_number} (${asset.equipment_type || 'Unknown'}) warranty expires on ${asset.warranty_date}`,
        type: 'warranty_expiring' as const,
        asset_id: asset.id,
        is_read: false
      }));

    if (notificationsToCreate.length === 0) {
      return { created: 0 };
    }

    // Batch insert notifications
    await db.insert(notificationsTable)
      .values(notificationsToCreate)
      .execute();

    return { created: notificationsToCreate.length };
  } catch (error) {
    console.error('Warranty notifications generation failed:', error);
    throw error;
  }
}

export async function generateRepairReminders(): Promise<{ created: number }> {
  try {
    // Calculate date 7 days ago (assets in repair for more than 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find assets that have been in repair status for more than 7 days
    const assetsInRepair = await db.select()
      .from(assetsTable)
      .where(
        and(
          eq(assetsTable.status, 'perbaikan'),
          sql`${assetsTable.updated_at} <= ${sevenDaysAgo}`
        )
      )
      .execute();

    if (assetsInRepair.length === 0) {
      return { created: 0 };
    }

    // Get existing repair reminder notifications for these assets (created in the last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const assetIds = assetsInRepair.map(a => a.id);

    let existingNotifications: any[] = [];
    if (assetIds.length > 0) {
      existingNotifications = await db.select()
        .from(notificationsTable)
        .where(
          and(
            eq(notificationsTable.type, 'repair_reminder'),
            inArray(notificationsTable.asset_id, assetIds),
            sql`${notificationsTable.created_at} >= ${weekAgo}`
          )
        )
        .execute();
    }

    const recentlyNotifiedAssetIds = new Set(existingNotifications.map(n => n.asset_id));

    // Create repair reminder notifications for assets that haven't been notified recently
    const notificationsToCreate = assetsInRepair
      .filter(asset => !recentlyNotifiedAssetIds.has(asset.id))
      .map(asset => ({
        title: 'Repair Status Reminder',
        message: `Asset ${asset.asset_number} (${asset.equipment_type || 'Unknown'}) has been in repair status since ${asset.updated_at?.toISOString().split('T')[0]}. Please update repair progress.`,
        type: 'repair_reminder' as const,
        asset_id: asset.id,
        is_read: false
      }));

    if (notificationsToCreate.length === 0) {
      return { created: 0 };
    }

    // Batch insert notifications
    await db.insert(notificationsTable)
      .values(notificationsToCreate)
      .execute();

    return { created: notificationsToCreate.length };
  } catch (error) {
    console.error('Repair reminders generation failed:', error);
    throw error;
  }
}