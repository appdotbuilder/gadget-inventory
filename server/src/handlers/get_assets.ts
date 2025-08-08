import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type Asset, type AssetSearchInput } from '../schema';
import { eq, and, or, ilike, desc, count, SQL } from 'drizzle-orm';

export async function getAssets(): Promise<Asset[]> {
  try {
    // Get all assets with pagination to prevent overwhelming responses
    const results = await db.select()
      .from(assetsTable)
      .orderBy(desc(assetsTable.created_at))
      .limit(1000) // Reasonable limit for all assets
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch assets:', error);
    throw error;
  }
}

export async function getAssetById(id: number): Promise<Asset | null> {
  try {
    const results = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, id))
      .limit(1)
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to fetch asset by ID:', error);
    throw error;
  }
}

export async function searchAssets(input: AssetSearchInput): Promise<{ assets: Asset[]; total: number; page: number; limit: number }> {
  try {
    const { search_term, category, status, user_unit, user_location, equipment_brand, page, limit } = input;
    const offset = (page - 1) * limit;

    // Build conditions array
    const conditions: SQL<unknown>[] = [];

    // Full-text search across multiple fields
    if (search_term) {
      const searchPattern = `%${search_term}%`;
      const searchOr = or(
        ilike(assetsTable.asset_number, searchPattern),
        ilike(assetsTable.user_name, searchPattern),
        ilike(assetsTable.user_nik, searchPattern),
        ilike(assetsTable.equipment_brand, searchPattern),
        ilike(assetsTable.equipment_type, searchPattern),
        ilike(assetsTable.inventory_number, searchPattern),
        ilike(assetsTable.serial_number, searchPattern),
        ilike(assetsTable.notes, searchPattern)
      );
      if (searchOr) {
        conditions.push(searchOr);
      }
    }

    // Category filter
    if (category) {
      conditions.push(eq(assetsTable.category, category));
    }

    // Status filter
    if (status) {
      conditions.push(eq(assetsTable.status, status));
    }

    // User unit filter
    if (user_unit) {
      conditions.push(ilike(assetsTable.user_unit, `%${user_unit}%`));
    }

    // User location filter
    if (user_location) {
      conditions.push(ilike(assetsTable.user_location, `%${user_location}%`));
    }

    // Equipment brand filter
    if (equipment_brand) {
      conditions.push(ilike(assetsTable.equipment_brand, `%${equipment_brand}%`));
    }

    // Execute count query
    const countQueryBuilder = db.select({ count: count() }).from(assetsTable);
    const totalResult = conditions.length > 0 
      ? await countQueryBuilder.where(and(...conditions)).execute()
      : await countQueryBuilder.execute();

    // Execute main query
    const mainQueryBuilder = db.select().from(assetsTable);
    const assets = conditions.length > 0
      ? await mainQueryBuilder
          .where(and(...conditions))
          .orderBy(desc(assetsTable.created_at))
          .limit(limit)
          .offset(offset)
          .execute()
      : await mainQueryBuilder
          .orderBy(desc(assetsTable.created_at))
          .limit(limit)
          .offset(offset)
          .execute();

    return {
      assets,
      total: totalResult[0].count,
      page,
      limit
    };
  } catch (error) {
    console.error('Failed to search assets:', error);
    throw error;
  }
}