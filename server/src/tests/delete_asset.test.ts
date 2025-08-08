import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assetsTable, notificationsTable } from '../db/schema';
import { type CreateAssetInput, type CreateNotificationInput } from '../schema';
import { deleteAsset } from '../handlers/delete_asset';
import { eq } from 'drizzle-orm';

// Test asset input with all required fields
const testAssetInput: CreateAssetInput = {
  user_nik: 'NIK123456',
  user_name: 'Test User',
  user_position: 'Software Engineer',
  user_unit: 'IT Department',
  user_location: 'Jakarta',
  asset_number: 'AST001',
  inventory_number: 'INV001',
  imei_number: '123456789012345',
  serial_number: 'SN123456',
  wifi_mac_address: '00:11:22:33:44:55',
  purchase_date: '2023-01-15',
  warranty_date: '2025-01-15',
  category: 'laptop',
  equipment_brand: 'Dell',
  equipment_type: 'Laptop',
  supplier: 'PT Technology',
  apk_harv: 'harv_app_v1',
  apk_upk: 'upk_app_v1',
  apk_nurs: 'nurs_app_v1',
  uuid_harvesting: 'uuid-harv-123',
  uuid_upkeep: 'uuid-upk-123',
  uuid_nursery: 'uuid-nurs-123',
  code_harvesting: 'HARV001',
  code_upkeep: 'UPK001',
  code_nursery: 'NURS001',
  code_replanting: 'REPL001',
  user_id_efact: 'efact_user_123',
  status: 'baik',
  notes: 'Test asset for deletion',
  repair_location: null,
  sent_to_regmis: false,
  sent_to_jkto: false,
  recommendation_number: 'REC001',
  gadget_usage: 'Daily work laptop'
};

// Test notification input
const testNotificationInput: CreateNotificationInput = {
  title: 'Test Notification',
  message: 'This is a test notification for asset',
  type: 'general',
  asset_id: null // Will be set in tests
};

describe('deleteAsset', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing asset', async () => {
    // Create test asset
    const assetResult = await db.insert(assetsTable)
      .values(testAssetInput)
      .returning()
      .execute();

    const assetId = assetResult[0].id;

    // Delete the asset
    const result = await deleteAsset(assetId);

    expect(result.success).toBe(true);

    // Verify asset is deleted from database
    const deletedAsset = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, assetId))
      .execute();

    expect(deletedAsset).toHaveLength(0);
  });

  it('should delete asset and its related notifications', async () => {
    // Create test asset
    const assetResult = await db.insert(assetsTable)
      .values(testAssetInput)
      .returning()
      .execute();

    const assetId = assetResult[0].id;

    // Create related notifications
    await db.insert(notificationsTable)
      .values([
        {
          ...testNotificationInput,
          asset_id: assetId,
          title: 'Notification 1'
        },
        {
          ...testNotificationInput,
          asset_id: assetId,
          title: 'Notification 2'
        }
      ])
      .execute();

    // Verify notifications exist before deletion
    const notificationsBefore = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.asset_id, assetId))
      .execute();

    expect(notificationsBefore).toHaveLength(2);

    // Delete the asset
    const result = await deleteAsset(assetId);

    expect(result.success).toBe(true);

    // Verify asset is deleted
    const deletedAsset = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, assetId))
      .execute();

    expect(deletedAsset).toHaveLength(0);

    // Verify related notifications are also deleted
    const notificationsAfter = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.asset_id, assetId))
      .execute();

    expect(notificationsAfter).toHaveLength(0);
  });

  it('should throw error when asset does not exist', async () => {
    const nonExistentId = 99999;

    await expect(deleteAsset(nonExistentId)).rejects.toThrow(/Asset with id 99999 not found/i);
  });

  it('should not delete other assets when deleting one asset', async () => {
    // Create two test assets
    const asset1Result = await db.insert(assetsTable)
      .values({
        ...testAssetInput,
        asset_number: 'AST001'
      })
      .returning()
      .execute();

    const asset2Result = await db.insert(assetsTable)
      .values({
        ...testAssetInput,
        asset_number: 'AST002'
      })
      .returning()
      .execute();

    const asset1Id = asset1Result[0].id;
    const asset2Id = asset2Result[0].id;

    // Delete only the first asset
    const result = await deleteAsset(asset1Id);

    expect(result.success).toBe(true);

    // Verify first asset is deleted
    const deletedAsset = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, asset1Id))
      .execute();

    expect(deletedAsset).toHaveLength(0);

    // Verify second asset still exists
    const remainingAsset = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, asset2Id))
      .execute();

    expect(remainingAsset).toHaveLength(1);
    expect(remainingAsset[0].asset_number).toBe('AST002');
  });

  it('should handle asset with no related notifications', async () => {
    // Create test asset without notifications
    const assetResult = await db.insert(assetsTable)
      .values(testAssetInput)
      .returning()
      .execute();

    const assetId = assetResult[0].id;

    // Delete the asset
    const result = await deleteAsset(assetId);

    expect(result.success).toBe(true);

    // Verify asset is deleted
    const deletedAsset = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, assetId))
      .execute();

    expect(deletedAsset).toHaveLength(0);
  });

  it('should only delete notifications related to the specific asset', async () => {
    // Create two test assets
    const asset1Result = await db.insert(assetsTable)
      .values({
        ...testAssetInput,
        asset_number: 'AST001'
      })
      .returning()
      .execute();

    const asset2Result = await db.insert(assetsTable)
      .values({
        ...testAssetInput,
        asset_number: 'AST002'
      })
      .returning()
      .execute();

    const asset1Id = asset1Result[0].id;
    const asset2Id = asset2Result[0].id;

    // Create notifications for both assets
    await db.insert(notificationsTable)
      .values([
        {
          ...testNotificationInput,
          asset_id: asset1Id,
          title: 'Asset 1 Notification'
        },
        {
          ...testNotificationInput,
          asset_id: asset2Id,
          title: 'Asset 2 Notification'
        }
      ])
      .execute();

    // Delete only the first asset
    await deleteAsset(asset1Id);

    // Verify notifications for asset 1 are deleted
    const asset1Notifications = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.asset_id, asset1Id))
      .execute();

    expect(asset1Notifications).toHaveLength(0);

    // Verify notifications for asset 2 still exist
    const asset2Notifications = await db.select()
      .from(notificationsTable)
      .where(eq(notificationsTable.asset_id, asset2Id))
      .execute();

    expect(asset2Notifications).toHaveLength(1);
    expect(asset2Notifications[0].title).toBe('Asset 2 Notification');
  });
});