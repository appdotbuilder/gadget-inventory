import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type UpdateAssetInput, type CreateAssetInput } from '../schema';
import { updateAsset } from '../handlers/update_asset';
import { eq } from 'drizzle-orm';

// Helper function to create a test asset
const createTestAsset = async (): Promise<number> => {
  const testAsset: CreateAssetInput = {
    user_nik: '1234567890',
    user_name: 'John Doe',
    user_position: 'Developer',
    user_unit: 'IT Department',
    user_location: 'Jakarta',
    asset_number: 'ASSET001',
    inventory_number: 'INV001',
    imei_number: '123456789012345',
    serial_number: 'SN001',
    wifi_mac_address: '00:11:22:33:44:55',
    purchase_date: '2024-01-15',
    warranty_date: '2027-01-15',
    category: 'smartphone',
    equipment_brand: 'Samsung',
    equipment_type: 'Galaxy S24',
    supplier: 'Tech Supply Co',
    apk_harv: 'harvest_app_v1',
    apk_upk: 'upkeep_app_v1',
    apk_nurs: 'nursery_app_v1',
    uuid_harvesting: 'uuid-harv-001',
    uuid_upkeep: 'uuid-upk-001',
    uuid_nursery: 'uuid-nurs-001',
    code_harvesting: 'HARV001',
    code_upkeep: 'UPK001',
    code_nursery: 'NURS001',
    code_replanting: 'REPL001',
    user_id_efact: 'efact001',
    status: 'baik',
    notes: 'Initial asset creation',
    repair_location: null,
    sent_to_regmis: false,
    sent_to_jkto: false,
    recommendation_number: 'REC001',
    gadget_usage: 'Field operations'
  };

  const result = await db.insert(assetsTable)
    .values({
      ...testAsset,
      qr_code: 'QR_TEST_001'
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateAsset', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update asset with basic fields', async () => {
    const assetId = await createTestAsset();

    const updateInput: UpdateAssetInput = {
      id: assetId,
      user_name: 'Jane Smith',
      user_position: 'Senior Developer',
      status: 'perbaikan',
      notes: 'Updated for maintenance'
    };

    const result = await updateAsset(updateInput);

    expect(result.id).toEqual(assetId);
    expect(result.user_name).toEqual('Jane Smith');
    expect(result.user_position).toEqual('Senior Developer');
    expect(result.status).toEqual('perbaikan');
    expect(result.notes).toEqual('Updated for maintenance');
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify unchanged fields remain the same
    expect(result.user_nik).toEqual('1234567890');
    expect(result.asset_number).toEqual('ASSET001');
    expect(result.category).toEqual('smartphone');
    expect(result.equipment_brand).toEqual('Samsung');
  });

  it('should update asset in database', async () => {
    const assetId = await createTestAsset();

    const updateInput: UpdateAssetInput = {
      id: assetId,
      equipment_brand: 'Apple',
      equipment_type: 'iPhone 15',
      category: 'smartphone',
      status: 'rusak'
    };

    await updateAsset(updateInput);

    // Verify the update was saved to database
    const savedAsset = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, assetId))
      .execute();

    expect(savedAsset).toHaveLength(1);
    expect(savedAsset[0].equipment_brand).toEqual('Apple');
    expect(savedAsset[0].equipment_type).toEqual('iPhone 15');
    expect(savedAsset[0].category).toEqual('smartphone');
    expect(savedAsset[0].status).toEqual('rusak');
    expect(savedAsset[0].updated_at).toBeInstanceOf(Date);
  });

  it('should update nullable fields to null', async () => {
    const assetId = await createTestAsset();

    const updateInput: UpdateAssetInput = {
      id: assetId,
      user_nik: null,
      user_name: null,
      notes: null,
      repair_location: null
    };

    const result = await updateAsset(updateInput);

    expect(result.user_nik).toBeNull();
    expect(result.user_name).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.repair_location).toBeNull();
  });

  it('should update boolean fields', async () => {
    const assetId = await createTestAsset();

    const updateInput: UpdateAssetInput = {
      id: assetId,
      sent_to_regmis: true,
      sent_to_jkto: true
    };

    const result = await updateAsset(updateInput);

    expect(result.sent_to_regmis).toBe(true);
    expect(result.sent_to_jkto).toBe(true);
  });

  it('should update date fields', async () => {
    const assetId = await createTestAsset();

    const updateInput: UpdateAssetInput = {
      id: assetId,
      purchase_date: '2024-06-01',
      warranty_date: '2027-06-01'
    };

    const result = await updateAsset(updateInput);

    expect(result.purchase_date).toEqual('2024-06-01');
    expect(result.warranty_date).toEqual('2027-06-01');
  });

  it('should update app-related fields', async () => {
    const assetId = await createTestAsset();

    const updateInput: UpdateAssetInput = {
      id: assetId,
      apk_harv: 'harvest_app_v2',
      apk_upk: 'upkeep_app_v2',
      apk_nurs: 'nursery_app_v2',
      uuid_harvesting: 'uuid-harv-002',
      uuid_upkeep: 'uuid-upk-002',
      uuid_nursery: 'uuid-nurs-002',
      code_harvesting: 'HARV002',
      code_upkeep: 'UPK002',
      code_nursery: 'NURS002',
      code_replanting: 'REPL002'
    };

    const result = await updateAsset(updateInput);

    expect(result.apk_harv).toEqual('harvest_app_v2');
    expect(result.apk_upk).toEqual('upkeep_app_v2');
    expect(result.apk_nurs).toEqual('nursery_app_v2');
    expect(result.uuid_harvesting).toEqual('uuid-harv-002');
    expect(result.uuid_upkeep).toEqual('uuid-upk-002');
    expect(result.uuid_nursery).toEqual('uuid-nurs-002');
    expect(result.code_harvesting).toEqual('HARV002');
    expect(result.code_upkeep).toEqual('UPK002');
    expect(result.code_nursery).toEqual('NURS002');
    expect(result.code_replanting).toEqual('REPL002');
  });

  it('should update only provided fields', async () => {
    const assetId = await createTestAsset();

    const updateInput: UpdateAssetInput = {
      id: assetId,
      status: 'hilang'
    };

    const result = await updateAsset(updateInput);

    // Only status should be updated
    expect(result.status).toEqual('hilang');

    // Other fields should remain unchanged
    expect(result.user_name).toEqual('John Doe');
    expect(result.asset_number).toEqual('ASSET001');
    expect(result.category).toEqual('smartphone');
    expect(result.equipment_brand).toEqual('Samsung');
  });

  it('should automatically update updated_at timestamp', async () => {
    const assetId = await createTestAsset();

    // Get the original timestamp
    const originalAsset = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, assetId))
      .execute();

    const originalUpdatedAt = originalAsset[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateAssetInput = {
      id: assetId,
      notes: 'Timestamp test'
    };

    const result = await updateAsset(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should throw error when asset not found', async () => {
    const updateInput: UpdateAssetInput = {
      id: 99999,
      status: 'baik'
    };

    await expect(updateAsset(updateInput)).rejects.toThrow(/Asset with id 99999 not found/i);
  });

  it('should handle unique constraint violation for asset_number', async () => {
    const assetId1 = await createTestAsset();

    // Create second asset with different asset_number
    await db.insert(assetsTable)
      .values({
        asset_number: 'ASSET002',
        category: 'laptop',
        status: 'baik',
        sent_to_regmis: false,
        sent_to_jkto: false,
        qr_code: 'QR_TEST_002'
      })
      .execute();

    const updateInput: UpdateAssetInput = {
      id: assetId1,
      asset_number: 'ASSET002' // This should cause unique constraint violation
    };

    await expect(updateAsset(updateInput)).rejects.toThrow();
  });

  it('should update equipment details', async () => {
    const assetId = await createTestAsset();

    const updateInput: UpdateAssetInput = {
      id: assetId,
      equipment_brand: 'Dell',
      equipment_type: 'Latitude 7520',
      category: 'laptop',
      supplier: 'Dell Indonesia',
      imei_number: null, // Remove IMEI since it's a laptop
      wifi_mac_address: '00:AA:BB:CC:DD:EE'
    };

    const result = await updateAsset(updateInput);

    expect(result.equipment_brand).toEqual('Dell');
    expect(result.equipment_type).toEqual('Latitude 7520');
    expect(result.category).toEqual('laptop');
    expect(result.supplier).toEqual('Dell Indonesia');
    expect(result.imei_number).toBeNull();
    expect(result.wifi_mac_address).toEqual('00:AA:BB:CC:DD:EE');
  });
});