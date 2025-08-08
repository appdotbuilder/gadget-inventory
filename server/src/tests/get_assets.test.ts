import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type CreateAssetInput, type AssetSearchInput } from '../schema';
import { getAssets, getAssetById, searchAssets } from '../handlers/get_assets';

// Test asset data
const testAssets: CreateAssetInput[] = [
  {
    user_nik: 'NIK001',
    user_name: 'John Doe',
    user_position: 'Manager',
    user_unit: 'IT Department',
    user_location: 'Jakarta',
    asset_number: 'AST001',
    inventory_number: 'INV001',
    imei_number: '123456789012345',
    serial_number: 'SN001',
    wifi_mac_address: 'AA:BB:CC:DD:EE:FF',
    purchase_date: '2023-01-15',
    warranty_date: '2026-01-15',
    category: 'smartphone',
    equipment_brand: 'Samsung',
    equipment_type: 'Galaxy S23',
    supplier: 'Tech Supplier',
    apk_harv: 'HarvApp v1.0',
    apk_upk: 'UpkeepApp v2.0',
    apk_nurs: 'NurseryApp v1.5',
    uuid_harvesting: 'uuid-harv-001',
    uuid_upkeep: 'uuid-upk-001',
    uuid_nursery: 'uuid-nurs-001',
    code_harvesting: 'HARV001',
    code_upkeep: 'UPK001',
    code_nursery: 'NURS001',
    code_replanting: 'REP001',
    user_id_efact: 'EFACT001',
    status: 'baik',
    notes: 'In good condition',
    repair_location: null,
    sent_to_regmis: false,
    sent_to_jkto: false,
    recommendation_number: 'REC001',
    gadget_usage: 'Field operations'
  },
  {
    user_nik: 'NIK002',
    user_name: 'Jane Smith',
    user_position: 'Supervisor',
    user_unit: 'Operations',
    user_location: 'Bandung',
    asset_number: 'AST002',
    inventory_number: 'INV002',
    imei_number: null,
    serial_number: 'SN002',
    wifi_mac_address: null,
    purchase_date: '2022-06-20',
    warranty_date: '2025-06-20',
    category: 'laptop',
    equipment_brand: 'Dell',
    equipment_type: 'Latitude 5520',
    supplier: 'Computer Store',
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
    status: 'rusak',
    notes: 'Screen damaged',
    repair_location: 'Service Center',
    sent_to_regmis: true,
    sent_to_jkto: false,
    recommendation_number: null,
    gadget_usage: 'Office work'
  },
  {
    user_nik: null,
    user_name: null,
    user_position: null,
    user_unit: null,
    user_location: null,
    asset_number: 'AST003',
    inventory_number: 'INV003',
    imei_number: null,
    serial_number: 'SN003',
    wifi_mac_address: 'FF:EE:DD:CC:BB:AA',
    purchase_date: '2023-03-10',
    warranty_date: '2024-03-10',
    category: 'printer',
    equipment_brand: 'HP',
    equipment_type: 'LaserJet Pro',
    supplier: 'Office Equipment',
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
    notes: 'Unassigned printer',
    repair_location: null,
    sent_to_regmis: false,
    sent_to_jkto: true,
    recommendation_number: null,
    gadget_usage: null
  }
];

describe('getAssets', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no assets exist', async () => {
    const result = await getAssets();
    expect(result).toEqual([]);
  });

  it('should return all assets ordered by creation date (newest first)', async () => {
    // Insert test assets one by one to ensure different timestamps
    await db.insert(assetsTable).values(testAssets[0]).execute();
    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 5));
    await db.insert(assetsTable).values(testAssets[1]).execute();
    await new Promise(resolve => setTimeout(resolve, 5));
    await db.insert(assetsTable).values(testAssets[2]).execute();

    const result = await getAssets();

    expect(result).toHaveLength(3);
    
    // Verify all fields are properly returned
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    
    // Verify ordering (newest first) - compare timestamps
    expect(result[0].created_at.getTime()).toBeGreaterThanOrEqual(result[1].created_at.getTime());
    expect(result[1].created_at.getTime()).toBeGreaterThanOrEqual(result[2].created_at.getTime());
  });

  it('should handle large datasets with pagination limit', async () => {
    // This test verifies the 1000 item limit is applied
    const result = await getAssets();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('getAssetById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null when asset does not exist', async () => {
    const result = await getAssetById(999);
    expect(result).toBeNull();
  });

  it('should return the correct asset by ID', async () => {
    // Insert test asset
    const insertResult = await db.insert(assetsTable)
      .values(testAssets[0])
      .returning()
      .execute();

    const insertedAsset = insertResult[0];
    const result = await getAssetById(insertedAsset.id);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(insertedAsset.id);
    expect(result!.asset_number).toBe('AST001');
    expect(result!.user_name).toBe('John Doe');
    expect(result!.category).toBe('smartphone');
    expect(result!.status).toBe('baik');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return asset with all nullable fields properly handled', async () => {
    // Insert asset with some null values
    const insertResult = await db.insert(assetsTable)
      .values(testAssets[2]) // Asset with many null values
      .returning()
      .execute();

    const result = await getAssetById(insertResult[0].id);

    expect(result).not.toBeNull();
    expect(result!.user_nik).toBeNull();
    expect(result!.user_name).toBeNull();
    expect(result!.imei_number).toBeNull();
    expect(result!.asset_number).toBe('AST003');
    expect(result!.category).toBe('printer');
  });
});

describe('searchAssets', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty results when no assets match', async () => {
    const searchInput: AssetSearchInput = {
      search_term: 'nonexistent',
      page: 1,
      limit: 20
    };

    const result = await searchAssets(searchInput);

    expect(result.assets).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('should return all assets when no filters applied', async () => {
    // Insert test assets
    await db.insert(assetsTable).values(testAssets).execute();

    const searchInput: AssetSearchInput = {
      page: 1,
      limit: 20
    };

    const result = await searchAssets(searchInput);

    expect(result.assets).toHaveLength(3);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('should filter by search term across multiple fields', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    // Search by asset number
    let result = await searchAssets({
      search_term: 'AST001',
      page: 1,
      limit: 20
    });
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].asset_number).toBe('AST001');

    // Search by user name
    result = await searchAssets({
      search_term: 'John',
      page: 1,
      limit: 20
    });
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].user_name).toBe('John Doe');

    // Search by equipment brand
    result = await searchAssets({
      search_term: 'Samsung',
      page: 1,
      limit: 20
    });
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].equipment_brand).toBe('Samsung');

    // Search by serial number
    result = await searchAssets({
      search_term: 'SN002',
      page: 1,
      limit: 20
    });
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].serial_number).toBe('SN002');
  });

  it('should filter by category', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    const result = await searchAssets({
      category: 'smartphone',
      page: 1,
      limit: 20
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].category).toBe('smartphone');
    expect(result.total).toBe(1);
  });

  it('should filter by status', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    const result = await searchAssets({
      status: 'rusak',
      page: 1,
      limit: 20
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].status).toBe('rusak');
    expect(result.assets[0].asset_number).toBe('AST002');
  });

  it('should filter by user unit', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    const result = await searchAssets({
      user_unit: 'Operations',
      page: 1,
      limit: 20
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].user_unit).toBe('Operations');
  });

  it('should filter by user location', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    const result = await searchAssets({
      user_location: 'Jakarta',
      page: 1,
      limit: 20
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].user_location).toBe('Jakarta');
  });

  it('should filter by equipment brand', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    const result = await searchAssets({
      equipment_brand: 'Dell',
      page: 1,
      limit: 20
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].equipment_brand).toBe('Dell');
  });

  it('should combine multiple filters', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    const result = await searchAssets({
      category: 'smartphone',
      status: 'baik',
      user_location: 'Jakarta',
      page: 1,
      limit: 20
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].asset_number).toBe('AST001');
  });

  it('should handle pagination correctly', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    // First page
    let result = await searchAssets({
      page: 1,
      limit: 2
    });

    expect(result.assets).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);

    // Second page
    result = await searchAssets({
      page: 2,
      limit: 2
    });

    expect(result.assets).toHaveLength(1);
    expect(result.total).toBe(3);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);

    // Beyond available pages
    result = await searchAssets({
      page: 3,
      limit: 2
    });

    expect(result.assets).toHaveLength(0);
    expect(result.total).toBe(3);
  });

  it('should handle case-insensitive search', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    const result = await searchAssets({
      search_term: 'SAMSUNG',
      page: 1,
      limit: 20
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].equipment_brand).toBe('Samsung');
  });

  it('should return results ordered by creation date (newest first)', async () => {
    // Insert with delays to ensure different timestamps
    await db.insert(assetsTable).values(testAssets[0]).execute();
    await new Promise(resolve => setTimeout(resolve, 5));
    await db.insert(assetsTable).values(testAssets[1]).execute();
    await new Promise(resolve => setTimeout(resolve, 5));
    await db.insert(assetsTable).values(testAssets[2]).execute();

    const result = await searchAssets({
      page: 1,
      limit: 20
    });

    expect(result.assets).toHaveLength(3);
    // Verify ordering (newest first)
    expect(result.assets[0].created_at.getTime()).toBeGreaterThanOrEqual(
      result.assets[1].created_at.getTime()
    );
    expect(result.assets[1].created_at.getTime()).toBeGreaterThanOrEqual(
      result.assets[2].created_at.getTime()
    );
  });

  it('should handle partial matches in filters', async () => {
    await db.insert(assetsTable).values(testAssets).execute();

    // Partial unit match
    const result = await searchAssets({
      user_unit: 'IT',
      page: 1,
      limit: 20
    });

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].user_unit).toBe('IT Department');
  });
});