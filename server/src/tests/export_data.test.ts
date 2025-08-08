import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { assetsTable, usersTable } from '../db/schema';
import { exportToExcel, exportToPdf } from '../handlers/export_data';
import { promises as fs } from 'fs';
import path from 'path';

const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');

// Test data
const testUser = {
  nik: 'TEST001',
  name: 'John Doe',
  position: 'Manager',
  unit: 'IT Department',
  location: 'Jakarta',
  user_type: 'user' as const
};

const testAssets = [
  {
    user_nik: 'TEST001',
    user_name: 'John Doe',
    user_position: 'Manager',
    user_unit: 'IT Department',
    user_location: 'Jakarta',
    asset_number: 'AST001',
    inventory_number: 'INV001',
    imei_number: '123456789012345',
    serial_number: 'SN001',
    wifi_mac_address: '00:11:22:33:44:55',
    purchase_date: '2023-01-15',
    warranty_date: '2025-01-15',
    category: 'smartphone' as const,
    equipment_brand: 'Samsung',
    equipment_type: 'Galaxy S21',
    supplier: 'Samsung Store',
    status: 'baik' as const,
    notes: 'Test smartphone',
    repair_location: null,
    sent_to_regmis: false,
    sent_to_jkto: false,
    recommendation_number: null,
    gadget_usage: 'Field work',
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
    user_id_efact: null
  },
  {
    user_nik: null,
    user_name: null,
    user_position: null,
    user_unit: null,
    user_location: null,
    asset_number: 'AST002',
    inventory_number: 'INV002',
    imei_number: null,
    serial_number: 'SN002',
    wifi_mac_address: null,
    purchase_date: '2023-06-20',
    warranty_date: '2026-06-20',
    category: 'laptop' as const,
    equipment_brand: 'Dell',
    equipment_type: 'Latitude 5520',
    supplier: 'Dell Indonesia',
    status: 'perbaikan' as const,
    notes: 'Under repair',
    repair_location: 'Service Center',
    sent_to_regmis: true,
    sent_to_jkto: false,
    recommendation_number: 'REC001',
    gadget_usage: null,
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
    user_id_efact: null
  }
];

// Helper to clean up test files
const cleanupTestFiles = async () => {
  try {
    const files = await fs.readdir(DOWNLOADS_DIR);
    const testFiles = files.filter(file => 
      file.includes('assets_export_') || file.includes('assets_report_')
    );
    
    for (const file of testFiles) {
      await fs.unlink(path.join(DOWNLOADS_DIR, file));
    }
  } catch (error) {
    // Directory might not exist, ignore error
  }
};

describe('exportToExcel', () => {
  beforeEach(async () => {
    await createDB();
    await cleanupTestFiles();
    
    // Create test user
    await db.insert(usersTable).values(testUser).execute();
    
    // Create test assets
    await db.insert(assetsTable).values(testAssets).execute();
  });
  
  afterEach(async () => {
    await cleanupTestFiles();
    await resetDB();
  });

  it('should generate CSV file with asset data', async () => {
    const result = await exportToExcel();

    // Check return structure
    expect(result).toHaveProperty('file_url');
    expect(result.file_url).toMatch(/^\/downloads\/assets_export_\d{8}_\d{6}\.csv$/);

    // Check file exists
    const filename = result.file_url.replace('/downloads/', '');
    const filepath = path.join(DOWNLOADS_DIR, filename);
    const fileExists = await fs.access(filepath).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);
  });

  it('should create valid CSV file with correct data', async () => {
    const result = await exportToExcel();
    
    // Read the generated CSV file
    const filename = result.file_url.replace('/downloads/', '');
    const filepath = path.join(DOWNLOADS_DIR, filename);
    
    const csvContent = await fs.readFile(filepath, 'utf8');
    const lines = csvContent.split('\n');

    // Check header row
    const headers = lines[0];
    expect(headers).toContain('Nomor Aset');
    expect(headers).toContain('Kategori');
    expect(headers).toContain('Status');
    expect(headers).toContain('Nama Pengguna');

    // Check data rows - filter out empty lines
    const nonEmptyLines = lines.filter(line => line.trim());
    expect(nonEmptyLines).toHaveLength(3); // Header + 2 data rows
    
    // Check first asset data
    const firstAsset = nonEmptyLines[1];
    expect(firstAsset).toContain('AST001');
    expect(firstAsset).toContain('Smartphone');
    expect(firstAsset).toContain('Baik');
    expect(firstAsset).toContain('John Doe');

    // Check second asset data
    const secondAsset = nonEmptyLines[2];
    expect(secondAsset).toContain('AST002');
    expect(secondAsset).toContain('Laptop');
    expect(secondAsset).toContain('Dalam Perbaikan');
  });

  it('should handle empty database', async () => {
    // Clear all assets
    await db.delete(assetsTable).execute();
    
    const result = await exportToExcel();
    
    expect(result).toHaveProperty('file_url');
    
    // File should still be created
    const filename = result.file_url.replace('/downloads/', '');
    const filepath = path.join(DOWNLOADS_DIR, filename);
    const fileExists = await fs.access(filepath).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);
    
    // Check CSV content - should only have headers
    const csvContent = await fs.readFile(filepath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    expect(lines).toHaveLength(1); // Only header row
    expect(lines[0]).toContain('Nomor Aset');
  });

  it('should handle CSV escaping correctly', async () => {
    // Add asset with special characters
    const specialAsset = {
      ...testAssets[0],
      asset_number: 'AST003',
      notes: 'Test with "quotes" and, commas',
      equipment_brand: 'Brand, Inc.'
    };
    
    await db.insert(assetsTable).values([specialAsset]).execute();
    
    const result = await exportToExcel();
    const filename = result.file_url.replace('/downloads/', '');
    const filepath = path.join(DOWNLOADS_DIR, filename);
    const csvContent = await fs.readFile(filepath, 'utf8');
    
    // Should contain properly escaped values
    expect(csvContent).toContain('"Test with ""quotes"" and, commas"');
    expect(csvContent).toContain('"Brand, Inc."');
  });
});

describe('exportToPdf', () => {
  beforeEach(async () => {
    await createDB();
    await cleanupTestFiles();
    
    // Create test user
    await db.insert(usersTable).values(testUser).execute();
    
    // Create test assets
    await db.insert(assetsTable).values(testAssets).execute();
  });
  
  afterEach(async () => {
    await cleanupTestFiles();
    await resetDB();
  });

  it('should generate HTML file with asset data', async () => {
    const result = await exportToPdf();

    // Check return structure
    expect(result).toHaveProperty('file_url');
    expect(result.file_url).toMatch(/^\/downloads\/assets_report_\d{8}_\d{6}\.html$/);

    // Check file exists
    const filename = result.file_url.replace('/downloads/', '');
    const filepath = path.join(DOWNLOADS_DIR, filename);
    const fileExists = await fs.access(filepath).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);
  });

  it('should create HTML file with proper content', async () => {
    const result = await exportToPdf();
    
    const filename = result.file_url.replace('/downloads/', '');
    const filepath = path.join(DOWNLOADS_DIR, filename);
    
    const htmlContent = await fs.readFile(filepath, 'utf8');
    
    // Check HTML structure
    expect(htmlContent).toContain('<!DOCTYPE html>');
    expect(htmlContent).toContain('LAPORAN DATA ASET');
    expect(htmlContent).toContain('RINGKASAN');
    expect(htmlContent).toContain('DETAIL ASET');
    
    // Check data content
    expect(htmlContent).toContain('AST001');
    expect(htmlContent).toContain('AST002');
    expect(htmlContent).toContain('Smartphone');
    expect(htmlContent).toContain('Laptop');
    expect(htmlContent).toContain('John Doe');
    
    // Check summary statistics
    expect(htmlContent).toContain('Total Aset: 2');
    expect(htmlContent).toContain('Baik');
    expect(htmlContent).toContain('Dalam Perbaikan');
  });

  it('should handle empty database for HTML', async () => {
    // Clear all assets
    await db.delete(assetsTable).execute();
    
    const result = await exportToPdf();
    
    expect(result).toHaveProperty('file_url');
    
    // File should still be created
    const filename = result.file_url.replace('/downloads/', '');
    const filepath = path.join(DOWNLOADS_DIR, filename);
    const fileExists = await fs.access(filepath).then(() => true).catch(() => false);
    expect(fileExists).toBe(true);
    
    const htmlContent = await fs.readFile(filepath, 'utf8');
    expect(htmlContent).toContain('Total Aset: 0');
    expect(htmlContent).toContain('<tbody>');
  });

  it('should create files with different timestamps', async () => {
    const result1 = await exportToPdf();
    
    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const result2 = await exportToPdf();
    
    expect(result1.file_url).not.toBe(result2.file_url);
    
    // Both files should exist
    const filename1 = result1.file_url.replace('/downloads/', '');
    const filename2 = result2.file_url.replace('/downloads/', '');
    
    const filepath1 = path.join(DOWNLOADS_DIR, filename1);
    const filepath2 = path.join(DOWNLOADS_DIR, filename2);
    
    const file1Exists = await fs.access(filepath1).then(() => true).catch(() => false);
    const file2Exists = await fs.access(filepath2).then(() => true).catch(() => false);
    
    expect(file1Exists).toBe(true);
    expect(file2Exists).toBe(true);
  });

  it('should handle large dataset efficiently', async () => {
    // Create many assets to test performance
    const categories = ['smartphone', 'tablet', 'laptop'] as const;
    const statuses = ['baik', 'rusak', 'perbaikan', 'hilang'] as const;
    
    const manyAssets = Array.from({ length: 50 }, (_, i) => ({
      ...testAssets[0],
      asset_number: `AST${String(i + 3).padStart(3, '0')}`,
      inventory_number: `INV${String(i + 3).padStart(3, '0')}`,
      equipment_brand: i % 2 === 0 ? 'Samsung' : 'Apple',
      category: categories[i % 3],
      status: statuses[i % 4]
    }));
    
    await db.insert(assetsTable).values(manyAssets).execute();
    
    const startTime = Date.now();
    const result = await exportToPdf();
    const endTime = Date.now();
    
    // Should complete within reasonable time (less than 5 seconds)
    expect(endTime - startTime).toBeLessThan(5000);
    
    // File should exist and contain all data
    const filename = result.file_url.replace('/downloads/', '');
    const filepath = path.join(DOWNLOADS_DIR, filename);
    const htmlContent = await fs.readFile(filepath, 'utf8');
    
    // Should show correct total count
    expect(htmlContent).toContain('Total Aset: 52'); // 2 original + 50 new
    
    // Should contain various asset numbers
    expect(htmlContent).toContain('AST003');
    expect(htmlContent).toContain('AST052');
  });

  it('should properly format Indonesian text', async () => {
    const result = await exportToPdf();
    
    const filename = result.file_url.replace('/downloads/', '');
    const filepath = path.join(DOWNLOADS_DIR, filename);
    const htmlContent = await fs.readFile(filepath, 'utf8');
    
    // Check Indonesian headers and labels
    expect(htmlContent).toContain('lang="id"');
    expect(htmlContent).toContain('Nomor Aset');
    expect(htmlContent).toContain('Kategori');
    expect(htmlContent).toContain('Status Aset');
    expect(htmlContent).toContain('Dalam Perbaikan');
    expect(htmlContent).toContain('Laporan dibuat pada');
  });
});