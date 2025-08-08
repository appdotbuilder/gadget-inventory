import { db } from '../db';
import { assetsTable, notificationsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteAsset(id: number): Promise<{ success: boolean }> {
  try {
    // First, check if the asset exists
    const existingAsset = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, id))
      .execute();

    if (existingAsset.length === 0) {
      throw new Error(`Asset with id ${id} not found`);
    }

    // Delete related notifications first (foreign key constraint)
    await db.delete(notificationsTable)
      .where(eq(notificationsTable.asset_id, id))
      .execute();

    // Delete the asset
    const deleteResult = await db.delete(assetsTable)
      .where(eq(assetsTable.id, id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Asset deletion failed:', error);
    throw error;
  }
}