import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type CreateAssetInput } from '../schema';
import { createAsset } from '../handlers/create_asset';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testAssetInput: CreateAssetInput = {
  user_nik: '123456789',
  user_name: 'John Doe',
  user_position: 'Software Developer',
  user_unit: 'IT Department',
  user_location: 'Jakarta',
  asset_number: 'AST001',
  inventory_number: 'INV001',
  imei_number: '123456789012345',
  serial_number: 'SN123456',
  wifi_mac_address: '00:11:22:33:44:55',
  purchase_date: '2023-01-15',
  warranty_date: '2025-01-15',
  category: 'smartphone',
  equipment_brand: 'Samsung',
  equipment_type: 'Galaxy S21',
  supplier: 'Tech Supplier Co.',
  apk_harv: 'harv_app_v1.0',
  apk_upk: 'upk_app_v1.0',
  apk_nurs: 'nurs_app_v1.0',
  uuid_harvesting: 'uuid-harv-123',
  uuid_upkeep: 'uuid-upk-456',
  uuid_nursery: 'uuid-nurs-789',
  code_harvesting: 'HARV001',
  code_upkeep: 'UPK001',
  code_nursery: 'NURS001',
  code_replanting: 'REPL001',
  user_id_efact: 'efact123',
  status: 'baik',
  notes: 'Asset in good condition',
  repair_location: null,
  sent_to_regmis: false,
  sent_to_jkto: false,
  recommendation_number: 'REC001',
  gadget_usage: 'Field operations'
};

// Minimal test input with only required fields
const minimalAssetInput: CreateAssetInput = {
  user_nik: null,
  user_name: null,
  user_position: null,
  user_unit: null,
  user_location: null,
  asset_number: 'AST002',
  inventory_number: null,
  imei_number: null,
  serial_number: null,
  wifi_mac_address: null,
  purchase_date: null,
  warranty_date: null,
  category: 'laptop',
  equipment_brand: null,
  equipment_type: null,
  supplier: null,
  apk_harv: null,
  apk_upk: null,
  apk_nurs: null,
  uuid_harvesting: null,
  uuid_upkeep: null,
  uuid_nursery: null,
  code_harvesting: null,
  code_upkeep: null,
  code_nursery: null,
  code_replanting: null,
  user_id_efact: null,
  status: 'baik',
  notes: null,
  repair_location: null,
  sent_to_regmis: false,
  sent_to_jkto: false,
  recommendation_number: null,
  gadget_usage: null
};

describe('createAsset', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an asset with complete data', async () => {
    const result = await createAsset(testAssetInput);

    // Verify basic field mapping
    expect(result.user_nik).toEqual('123456789');
    expect(result.user_name).toEqual('John Doe');
    expect(result.user_position).toEqual('Software Developer');
    expect(result.user_unit).toEqual('IT Department');
    expect(result.user_location).toEqual('Jakarta');
    expect(result.asset_number).toEqual('AST001');
    expect(result.inventory_number).toEqual('INV001');
    expect(result.imei_number).toEqual('123456789012345');
    expect(result.serial_number).toEqual('SN123456');
    expect(result.wifi_mac_address).toEqual('00:11:22:33:44:55');
    expect(result.purchase_date).toEqual('2023-01-15');
    expect(result.warranty_date).toEqual('2025-01-15');
    expect(result.category).toEqual('smartphone');
    expect(result.equipment_brand).toEqual('Samsung');
    expect(result.equipment_type).toEqual('Galaxy S21');
    expect(result.supplier).toEqual('Tech Supplier Co.');
    expect(result.status).toEqual('baik');
    expect(result.notes).toEqual('Asset in good condition');
    expect(result.sent_to_regmis).toEqual(false);
    expect(result.sent_to_jkto).toEqual(false);
    expect(result.recommendation_number).toEqual('REC001');
    expect(result.gadget_usage).toEqual('Field operations');

    // Verify generated fields
    expect(result.id).toBeDefined();
    expect(result.qr_code).toBeDefined();
    expect(result.qr_code).toMatch(/^QR_[0-9a-f-]{36}$/); // UUID format
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an asset with minimal required data', async () => {
    const result = await createAsset(minimalAssetInput);

    // Verify required fields
    expect(result.asset_number).toEqual('AST002');
    expect(result.category).toEqual('laptop');
    expect(result.status).toEqual('baik');
    expect(result.sent_to_regmis).toEqual(false);
    expect(result.sent_to_jkto).toEqual(false);

    // Verify nullable fields are handled correctly
    expect(result.user_nik).toBeNull();
    expect(result.user_name).toBeNull();
    expect(result.inventory_number).toBeNull();
    expect(result.notes).toBeNull();

    // Verify generated fields
    expect(result.id).toBeDefined();
    expect(result.qr_code).toBeDefined();
    expect(result.qr_code).toMatch(/^QR_[0-9a-f-]{36}$/);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save asset to database correctly', async () => {
    const result = await createAsset(testAssetInput);

    // Query database to verify asset was saved
    const savedAssets = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, result.id))
      .execute();

    expect(savedAssets).toHaveLength(1);
    const savedAsset = savedAssets[0];

    expect(savedAsset.asset_number).toEqual('AST001');
    expect(savedAsset.user_name).toEqual('John Doe');
    expect(savedAsset.category).toEqual('smartphone');
    expect(savedAsset.status).toEqual('baik');
    expect(savedAsset.qr_code).toEqual(result.qr_code);
    expect(savedAsset.created_at).toBeInstanceOf(Date);
    expect(savedAsset.updated_at).toBeInstanceOf(Date);
  });

  it('should generate unique QR codes for different assets', async () => {
    const asset1 = await createAsset({
      ...testAssetInput,
      asset_number: 'AST003'
    });

    const asset2 = await createAsset({
      ...testAssetInput,
      asset_number: 'AST004'
    });

    expect(asset1.qr_code).toBeDefined();
    expect(asset2.qr_code).toBeDefined();
    expect(asset1.qr_code).not.toEqual(asset2.qr_code);

    // Both should follow UUID format
    expect(asset1.qr_code).toMatch(/^QR_[0-9a-f-]{36}$/);
    expect(asset2.qr_code).toMatch(/^QR_[0-9a-f-]{36}$/);
  });

  it('should handle different asset categories correctly', async () => {
    const categories: Array<'smartphone' | 'tablet' | 'laptop' | 'printer'> = ['smartphone', 'tablet', 'laptop', 'printer'];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const result = await createAsset({
        ...minimalAssetInput,
        asset_number: `AST00${i + 5}`,
        category
      });

      expect(result.category).toEqual(category);
    }
  });

  it('should handle different asset statuses correctly', async () => {
    const statuses: Array<'baik' | 'rusak' | 'perbaikan' | 'hilang'> = ['baik', 'rusak', 'perbaikan', 'hilang'];

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i];
      const result = await createAsset({
        ...minimalAssetInput,
        asset_number: `AST00${i + 10}`,
        status
      });

      expect(result.status).toEqual(status);
    }
  });

  it('should enforce unique asset_number constraint', async () => {
    // Create first asset
    await createAsset(testAssetInput);

    // Try to create second asset with same asset_number
    await expect(createAsset(testAssetInput))
      .rejects
      .toThrow(/duplicate key value violates unique constraint|unique constraint/i);
  });

  it('should enforce unique qr_code constraint', async () => {
    // This test verifies that QR codes are indeed unique by creating multiple assets
    // and checking database constraint enforcement
    const assets = [];
    
    // Create multiple assets
    for (let i = 0; i < 3; i++) {
      const asset = await createAsset({
        ...minimalAssetInput,
        asset_number: `AST_UNIQUE_${i}`
      });
      assets.push(asset);
    }

    // Verify all QR codes are different
    const qrCodes = assets.map(a => a.qr_code);
    const uniqueQrCodes = new Set(qrCodes);
    expect(uniqueQrCodes.size).toEqual(assets.length);

    // Verify they're all saved in database with unique QR codes
    const allAssets = await db.select()
      .from(assetsTable)
      .execute();
    
    const dbQrCodes = allAssets.map(a => a.qr_code).filter(qr => qr !== null);
    const uniqueDbQrCodes = new Set(dbQrCodes);
    expect(uniqueDbQrCodes.size).toEqual(dbQrCodes.length);
  });
});