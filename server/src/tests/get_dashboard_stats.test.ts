import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assetsTable } from '../db/schema';
import { getDashboardStats } from '../handlers/get_dashboard_stats';
import { type CreateAssetInput } from '../schema';

// Helper function to create test assets with various configurations
const createTestAsset = (overrides: Partial<CreateAssetInput> = {}): CreateAssetInput => ({
  user_nik: null,
  user_name: null,
  user_position: null,
  user_unit: null,
  user_location: null,
  asset_number: `AST-${Math.random().toString(36).substr(2, 9)}`,
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
  gadget_usage: null,
  ...overrides
});

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty stats when no assets exist', async () => {
    const result = await getDashboardStats();

    expect(result.total_assets).toEqual(0);
    expect(result.assets_by_category).toEqual({});
    expect(result.assets_by_status).toEqual({});
    expect(result.assets_by_location).toEqual({});
    expect(result.warranty_expiring_soon).toEqual(0);
    expect(result.assets_in_repair).toEqual(0);
  });

  it('should count total assets correctly', async () => {
    // Create test assets
    await db.insert(assetsTable).values([
      createTestAsset({ asset_number: 'AST-001', category: 'laptop' }),
      createTestAsset({ asset_number: 'AST-002', category: 'smartphone' }),
      createTestAsset({ asset_number: 'AST-003', category: 'tablet' })
    ]).execute();

    const result = await getDashboardStats();

    expect(result.total_assets).toEqual(3);
  });

  it('should group assets by category correctly', async () => {
    // Create assets with different categories
    await db.insert(assetsTable).values([
      createTestAsset({ asset_number: 'AST-001', category: 'laptop' }),
      createTestAsset({ asset_number: 'AST-002', category: 'laptop' }),
      createTestAsset({ asset_number: 'AST-003', category: 'smartphone' }),
      createTestAsset({ asset_number: 'AST-004', category: 'tablet' }),
      createTestAsset({ asset_number: 'AST-005', category: 'printer' })
    ]).execute();

    const result = await getDashboardStats();

    expect(result.assets_by_category).toEqual({
      laptop: 2,
      smartphone: 1,
      tablet: 1,
      printer: 1
    });
  });

  it('should group assets by status correctly', async () => {
    // Create assets with different statuses
    await db.insert(assetsTable).values([
      createTestAsset({ asset_number: 'AST-001', status: 'baik' }),
      createTestAsset({ asset_number: 'AST-002', status: 'baik' }),
      createTestAsset({ asset_number: 'AST-003', status: 'rusak' }),
      createTestAsset({ asset_number: 'AST-004', status: 'perbaikan' }),
      createTestAsset({ asset_number: 'AST-005', status: 'hilang' })
    ]).execute();

    const result = await getDashboardStats();

    expect(result.assets_by_status).toEqual({
      baik: 2,
      rusak: 1,
      perbaikan: 1,
      hilang: 1
    });
  });

  it('should group assets by location correctly (excluding null locations)', async () => {
    // Create assets with different locations
    await db.insert(assetsTable).values([
      createTestAsset({ asset_number: 'AST-001', user_location: 'Jakarta' }),
      createTestAsset({ asset_number: 'AST-002', user_location: 'Jakarta' }),
      createTestAsset({ asset_number: 'AST-003', user_location: 'Bandung' }),
      createTestAsset({ asset_number: 'AST-004', user_location: null }), // Should be excluded
      createTestAsset({ asset_number: 'AST-005', user_location: 'Surabaya' })
    ]).execute();

    const result = await getDashboardStats();

    expect(result.assets_by_location).toEqual({
      Jakarta: 2,
      Bandung: 1,
      Surabaya: 1
    });
    // Null locations should not appear in the results
    expect(result.assets_by_location['']).toBeUndefined();
  });

  it('should count assets in repair status correctly', async () => {
    // Create assets with different statuses, focusing on repair
    await db.insert(assetsTable).values([
      createTestAsset({ asset_number: 'AST-001', status: 'baik' }),
      createTestAsset({ asset_number: 'AST-002', status: 'perbaikan' }),
      createTestAsset({ asset_number: 'AST-003', status: 'perbaikan' }),
      createTestAsset({ asset_number: 'AST-004', status: 'rusak' }),
      createTestAsset({ asset_number: 'AST-005', status: 'perbaikan' })
    ]).execute();

    const result = await getDashboardStats();

    expect(result.assets_in_repair).toEqual(3);
  });

  it('should count warranty expiring soon correctly', async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const twentyDaysFromNow = new Date(today);
    twentyDaysFromNow.setDate(today.getDate() + 20);
    
    const fortyDaysFromNow = new Date(today);
    fortyDaysFromNow.setDate(today.getDate() + 40);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Format dates as YYYY-MM-DD strings
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const twentyDaysStr = twentyDaysFromNow.toISOString().split('T')[0];
    const fortyDaysStr = fortyDaysFromNow.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await db.insert(assetsTable).values([
      // Within 30 days - should be counted
      createTestAsset({ asset_number: 'AST-001', warranty_date: tomorrowStr }),
      createTestAsset({ asset_number: 'AST-002', warranty_date: twentyDaysStr }),
      
      // Beyond 30 days - should not be counted
      createTestAsset({ asset_number: 'AST-003', warranty_date: fortyDaysStr }),
      
      // Already expired - should not be counted
      createTestAsset({ asset_number: 'AST-004', warranty_date: yesterdayStr }),
      
      // No warranty date - should not be counted
      createTestAsset({ asset_number: 'AST-005', warranty_date: null })
    ]).execute();

    const result = await getDashboardStats();

    expect(result.warranty_expiring_soon).toEqual(2);
  });

  it('should handle comprehensive dashboard scenario', async () => {
    const today = new Date();
    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(today.getDate() + 10);
    const tenDaysStr = tenDaysFromNow.toISOString().split('T')[0];

    // Create a comprehensive set of test data
    await db.insert(assetsTable).values([
      // Jakarta laptops
      createTestAsset({ 
        asset_number: 'AST-001', 
        category: 'laptop', 
        status: 'baik', 
        user_location: 'Jakarta' 
      }),
      createTestAsset({ 
        asset_number: 'AST-002', 
        category: 'laptop', 
        status: 'perbaikan', 
        user_location: 'Jakarta',
        warranty_date: tenDaysStr 
      }),
      
      // Bandung smartphones
      createTestAsset({ 
        asset_number: 'AST-003', 
        category: 'smartphone', 
        status: 'baik', 
        user_location: 'Bandung' 
      }),
      createTestAsset({ 
        asset_number: 'AST-004', 
        category: 'smartphone', 
        status: 'rusak', 
        user_location: 'Bandung' 
      }),
      
      // Unassigned tablet
      createTestAsset({ 
        asset_number: 'AST-005', 
        category: 'tablet', 
        status: 'baik', 
        user_location: null 
      })
    ]).execute();

    const result = await getDashboardStats();

    // Verify all statistics
    expect(result.total_assets).toEqual(5);
    
    expect(result.assets_by_category).toEqual({
      laptop: 2,
      smartphone: 2,
      tablet: 1
    });
    
    expect(result.assets_by_status).toEqual({
      baik: 3,
      perbaikan: 1,
      rusak: 1
    });
    
    expect(result.assets_by_location).toEqual({
      Jakarta: 2,
      Bandung: 2
    });
    
    expect(result.assets_in_repair).toEqual(1);
    expect(result.warranty_expiring_soon).toEqual(1);
  });

  it('should handle edge case with warranty on exact 30th day', async () => {
    const today = new Date();
    const exactlyThirtyDays = new Date(today);
    exactlyThirtyDays.setDate(today.getDate() + 30);
    
    const thirtyOneDays = new Date(today);
    thirtyOneDays.setDate(today.getDate() + 31);

    const thirtyDaysStr = exactlyThirtyDays.toISOString().split('T')[0];
    const thirtyOneDaysStr = thirtyOneDays.toISOString().split('T')[0];

    await db.insert(assetsTable).values([
      // Exactly 30 days - should be included
      createTestAsset({ asset_number: 'AST-001', warranty_date: thirtyDaysStr }),
      // 31 days - should not be included
      createTestAsset({ asset_number: 'AST-002', warranty_date: thirtyOneDaysStr })
    ]).execute();

    const result = await getDashboardStats();

    expect(result.warranty_expiring_soon).toEqual(1);
  });
});