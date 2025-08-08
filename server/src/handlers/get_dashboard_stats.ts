import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type DashboardStats } from '../schema';
import { count, eq, and, isNotNull } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total assets count
    const totalAssetsResult = await db.select({ count: count() })
      .from(assetsTable)
      .execute();
    
    const total_assets = totalAssetsResult[0].count;

    // Get assets by category
    const categoryResult = await db.select({
      category: assetsTable.category,
      count: count()
    })
      .from(assetsTable)
      .groupBy(assetsTable.category)
      .execute();

    const assets_by_category: Record<string, number> = {};
    categoryResult.forEach(row => {
      assets_by_category[row.category] = row.count;
    });

    // Get assets by status
    const statusResult = await db.select({
      status: assetsTable.status,
      count: count()
    })
      .from(assetsTable)
      .groupBy(assetsTable.status)
      .execute();

    const assets_by_status: Record<string, number> = {};
    statusResult.forEach(row => {
      assets_by_status[row.status] = row.count;
    });

    // Get assets by location (only non-null locations)
    const locationResult = await db.select({
      location: assetsTable.user_location,
      count: count()
    })
      .from(assetsTable)
      .where(isNotNull(assetsTable.user_location))
      .groupBy(assetsTable.user_location)
      .execute();

    const assets_by_location: Record<string, number> = {};
    locationResult.forEach(row => {
      if (row.location) {
        assets_by_location[row.location] = row.count;
      }
    });

    // Get warranty expiring soon (within 30 days)
    // Calculate 30 days from now in YYYY-MM-DD format
    const today = new Date();
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const todayStr = today.toISOString().split('T')[0];
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0];

    const warrantyExpiringResult = await db.select({ count: count() })
      .from(assetsTable)
      .where(
        and(
          isNotNull(assetsTable.warranty_date),
          sql`${assetsTable.warranty_date} >= ${todayStr}`,
          sql`${assetsTable.warranty_date} <= ${thirtyDaysStr}`
        )
      )
      .execute();

    const warranty_expiring_soon = warrantyExpiringResult[0].count;

    // Get assets in repair status
    const assetsInRepairResult = await db.select({ count: count() })
      .from(assetsTable)
      .where(eq(assetsTable.status, 'perbaikan'))
      .execute();

    const assets_in_repair = assetsInRepairResult[0].count;

    return {
      total_assets,
      assets_by_category,
      assets_by_status,
      assets_by_location,
      warranty_expiring_soon,
      assets_in_repair
    };
  } catch (error) {
    console.error('Dashboard stats retrieval failed:', error);
    throw error;
  }
}