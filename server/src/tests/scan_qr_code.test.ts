import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type QrCodeScanInput, type CreateAssetInput } from '../schema';
import { scanQrCode } from '../handlers/scan_qr_code';

// Test asset data with QR code
const testAssetWithQr: CreateAssetInput = {
  user_nik: 'TEST123',
  user_name: 'John Doe',
  user_position: 'Developer',
  user_unit: 'IT Department',
  user_location: 'Jakarta',
  asset_number: 'ASSET001',
  inventory_number: 'INV001',
  imei_number: '123456789012345',
  serial_number: 'SN001',
  wifi_mac_address: 'AA:BB:CC:DD:EE:FF',
  purchase_date: '2023-01-15',
  warranty_date: '2025-01-15',
  category: 'smartphone',
  equipment_brand: 'Samsung',
  equipment_type: 'Galaxy S21',
  supplier: 'PT. Tech Store',
  apk_harv: 'harvesting_app_v1',
  apk_upk: 'upkeep_app_v1',
  apk_nurs: 'nursery_app_v1',
  uuid_harvesting: 'harv-uuid-123',
  uuid_upkeep: 'upkeep-uuid-123',
  uuid_nursery: 'nursery-uuid-123',
  code_harvesting: 'HARV001',
  code_upkeep: 'UPK001',
  code_nursery: 'NURS001',
  code_replanting: 'REPL001',
  user_id_efact: 'EF001',
  status: 'baik',
  notes: 'Test asset for QR scanning',
  repair_location: null,
  sent_to_regmis: false,
  sent_to_jkto: false,
  recommendation_number: null,
  gadget_usage: 'Field operations'
};

// Test asset without QR code
const testAssetNoQr: CreateAssetInput = {
  user_nik: 'TEST456',
  user_name: 'Jane Smith',
  user_position: 'Manager',
  user_unit: 'Operations',
  user_location: 'Bandung',
  asset_number: 'ASSET002',
  inventory_number: 'INV002',
  imei_number: '987654321098765',
  serial_number: 'SN002',
  wifi_mac_address: 'FF:EE:DD:CC:BB:AA',
  purchase_date: '2023-02-20',
  warranty_date: '2025-02-20',
  category: 'laptop',
  equipment_brand: 'Dell',
  equipment_type: 'Latitude 7420',
  supplier: 'PT. Computer World',
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
  notes: 'Asset without QR code',
  repair_location: null,
  sent_to_regmis: false,
  sent_to_jkto: false,
  recommendation_number: null,
  gadget_usage: 'Office work'
};

describe('scanQrCode', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return asset when QR code exists', async () => {
    // Create test asset with QR code
    await db.insert(assetsTable)
      .values({
        ...testAssetWithQr,
        qr_code: 'QR123456789'
      })
      .execute();

    const input: QrCodeScanInput = {
      qr_code: 'QR123456789'
    };

    const result = await scanQrCode(input);

    // Should return the asset
    expect(result).not.toBeNull();
    expect(result!.asset_number).toEqual('ASSET001');
    expect(result!.user_name).toEqual('John Doe');
    expect(result!.category).toEqual('smartphone');
    expect(result!.status).toEqual('baik');
    expect(result!.qr_code).toEqual('QR123456789');
    expect(result!.equipment_brand).toEqual('Samsung');
    expect(result!.equipment_type).toEqual('Galaxy S21');
    expect(result!.id).toBeDefined();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when QR code does not exist', async () => {
    // Create test asset without the QR code we're searching for
    await db.insert(assetsTable)
      .values({
        ...testAssetNoQr,
        qr_code: 'DIFFERENT_QR_CODE'
      })
      .execute();

    const input: QrCodeScanInput = {
      qr_code: 'NONEXISTENT_QR'
    };

    const result = await scanQrCode(input);

    // Should return null
    expect(result).toBeNull();
  });

  it('should return null when no assets have QR codes', async () => {
    // Create test asset without QR code (qr_code will be null)
    await db.insert(assetsTable)
      .values(testAssetNoQr)
      .execute();

    const input: QrCodeScanInput = {
      qr_code: 'ANY_QR_CODE'
    };

    const result = await scanQrCode(input);

    // Should return null
    expect(result).toBeNull();
  });

  it('should return correct asset when multiple assets exist', async () => {
    // Create multiple test assets with different QR codes
    await db.insert(assetsTable)
      .values([
        {
          ...testAssetWithQr,
          asset_number: 'ASSET001',
          qr_code: 'QR_FIRST'
        },
        {
          ...testAssetNoQr,
          asset_number: 'ASSET002',
          qr_code: 'QR_SECOND'
        }
      ])
      .execute();

    const input: QrCodeScanInput = {
      qr_code: 'QR_SECOND'
    };

    const result = await scanQrCode(input);

    // Should return the correct asset
    expect(result).not.toBeNull();
    expect(result!.asset_number).toEqual('ASSET002');
    expect(result!.qr_code).toEqual('QR_SECOND');
    expect(result!.user_name).toEqual('Jane Smith');
    expect(result!.category).toEqual('laptop');
  });

  it('should handle empty string QR code', async () => {
    // Create test asset with actual QR code
    await db.insert(assetsTable)
      .values({
        ...testAssetWithQr,
        qr_code: 'VALID_QR'
      })
      .execute();

    const input: QrCodeScanInput = {
      qr_code: ''
    };

    const result = await scanQrCode(input);

    // Should return null for empty QR code
    expect(result).toBeNull();
  });

  it('should return asset with all expected fields populated', async () => {
    // Create comprehensive test asset
    await db.insert(assetsTable)
      .values({
        ...testAssetWithQr,
        qr_code: 'COMPREHENSIVE_QR',
        warranty_date: '2024-12-31',
        notes: 'Comprehensive test asset'
      })
      .execute();

    const input: QrCodeScanInput = {
      qr_code: 'COMPREHENSIVE_QR'
    };

    const result = await scanQrCode(input);

    // Verify all important fields are present
    expect(result).not.toBeNull();
    expect(result!.user_nik).toEqual('TEST123');
    expect(result!.user_name).toEqual('John Doe');
    expect(result!.user_position).toEqual('Developer');
    expect(result!.user_unit).toEqual('IT Department');
    expect(result!.user_location).toEqual('Jakarta');
    expect(result!.asset_number).toEqual('ASSET001');
    expect(result!.inventory_number).toEqual('INV001');
    expect(result!.imei_number).toEqual('123456789012345');
    expect(result!.serial_number).toEqual('SN001');
    expect(result!.wifi_mac_address).toEqual('AA:BB:CC:DD:EE:FF');
    expect(result!.purchase_date).toEqual('2023-01-15');
    expect(result!.warranty_date).toEqual('2024-12-31');
    expect(result!.category).toEqual('smartphone');
    expect(result!.equipment_brand).toEqual('Samsung');
    expect(result!.equipment_type).toEqual('Galaxy S21');
    expect(result!.supplier).toEqual('PT. Tech Store');
    expect(result!.status).toEqual('baik');
    expect(result!.notes).toEqual('Comprehensive test asset');
    expect(result!.sent_to_regmis).toEqual(false);
    expect(result!.sent_to_jkto).toEqual(false);
    expect(result!.gadget_usage).toEqual('Field operations');
    expect(result!.qr_code).toEqual('COMPREHENSIVE_QR');
  });
});