import { db } from '../db';
import { assetsTable } from '../db/schema';
import { promises as fs } from 'fs';
import path from 'path';

// Ensure downloads directory exists
const DOWNLOADS_DIR = path.join(process.cwd(), 'downloads');

const ensureDownloadsDir = async () => {
  try {
    await fs.access(DOWNLOADS_DIR);
  } catch {
    await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
  }
};

// Indonesian column headers mapping
const COLUMN_HEADERS = {
  asset_number: 'Nomor Aset',
  inventory_number: 'Nomor Inventaris',
  category: 'Kategori',
  equipment_brand: 'Merek Perangkat',
  equipment_type: 'Tipe Perangkat',
  status: 'Status',
  user_nik: 'NIK Pengguna',
  user_name: 'Nama Pengguna',
  user_position: 'Posisi Pengguna',
  user_unit: 'Unit Pengguna',
  user_location: 'Lokasi Pengguna',
  serial_number: 'Nomor Seri',
  imei_number: 'Nomor IMEI',
  wifi_mac_address: 'Alamat MAC WiFi',
  purchase_date: 'Tanggal Pembelian',
  warranty_date: 'Tanggal Garansi',
  supplier: 'Pemasok',
  repair_location: 'Lokasi Perbaikan',
  notes: 'Catatan',
  created_at: 'Tanggal Dibuat',
  updated_at: 'Tanggal Diperbarui'
};

// Status mapping to Indonesian
const STATUS_MAPPING = {
  baik: 'Baik',
  rusak: 'Rusak',
  perbaikan: 'Dalam Perbaikan',
  hilang: 'Hilang'
};

// Category mapping to Indonesian
const CATEGORY_MAPPING = {
  smartphone: 'Smartphone',
  tablet: 'Tablet',
  laptop: 'Laptop',
  desktop: 'Desktop',
  printer: 'Printer',
  scanner: 'Scanner',
  router: 'Router',
  switch: 'Switch',
  access_point: 'Access Point',
  other: 'Lainnya'
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatDateOnly = (date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

export async function exportToExcel(): Promise<{ file_url: string }> {
  try {
    await ensureDownloadsDir();
    
    // Fetch all assets from database
    const assets = await db.select().from(assetsTable).execute();
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
    const filename = `assets_export_${timestamp}.csv`;
    const filepath = path.join(DOWNLOADS_DIR, filename);
    
    // Create CSV content (as Excel alternative)
    const headers = Object.values(COLUMN_HEADERS).join(',');
    const rows = assets.map(asset => {
      const values = [
        asset.asset_number || '',
        asset.inventory_number || '',
        CATEGORY_MAPPING[asset.category] || asset.category,
        asset.equipment_brand || '',
        asset.equipment_type || '',
        STATUS_MAPPING[asset.status] || asset.status,
        asset.user_nik || '',
        asset.user_name || '',
        asset.user_position || '',
        asset.user_unit || '',
        asset.user_location || '',
        asset.serial_number || '',
        asset.imei_number || '',
        asset.wifi_mac_address || '',
        asset.purchase_date || '',
        asset.warranty_date || '',
        asset.supplier || '',
        asset.repair_location || '',
        asset.notes || '',
        formatDate(asset.created_at),
        formatDate(asset.updated_at)
      ];
      
      // Escape CSV values that contain commas or quotes
      return values.map(value => {
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Write CSV file (can be opened in Excel)
    await fs.writeFile(filepath, '\uFEFF' + csvContent, 'utf8'); // BOM for proper UTF-8 handling in Excel
    
    return { file_url: `/downloads/${filename}` };
  } catch (error) {
    console.error('Excel export failed:', error);
    throw error;
  }
}

export async function exportToPdf(): Promise<{ file_url: string }> {
  try {
    await ensureDownloadsDir();
    
    // Fetch all assets from database
    const assets = await db.select().from(assetsTable).execute();
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
    const filename = `assets_report_${timestamp}.html`;
    const filepath = path.join(DOWNLOADS_DIR, filename);
    
    // Calculate summary statistics
    const totalAssets = assets.length;
    const statusCounts = assets.reduce((acc, asset) => {
      const status = STATUS_MAPPING[asset.status] || asset.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categoryCounts = assets.reduce((acc, asset) => {
      const category = CATEGORY_MAPPING[asset.category] || asset.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Generate HTML report (can be printed to PDF)
    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Data Aset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .header p {
            font-size: 14px;
            color: #7f8c8d;
        }
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .summary h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #2c3e50;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .summary-section {
            background: white;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e9ecef;
        }
        .summary-section h3 {
            font-size: 14px;
            margin-bottom: 10px;
            color: #495057;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 12px;
        }
        .table-container {
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 11px;
        }
        th, td {
            border: 1px solid #dee2e6;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
        }
        tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        tbody tr:hover {
            background-color: #e9ecef;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #6c757d;
        }
        @media print {
            body { margin: 10px; }
            .summary-grid { grid-template-columns: 1fr; }
            table { font-size: 9px; }
            th, td { padding: 4px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN DATA ASET</h1>
        <p>Tanggal: ${formatDateOnly(new Date())}</p>
    </div>

    <div class="summary">
        <h2>RINGKASAN</h2>
        <div class="summary-grid">
            <div class="summary-section">
                <h3>Total Aset: ${totalAssets}</h3>
                <h3>Status Aset:</h3>
                ${Object.entries(statusCounts).map(([status, count]) => 
                    `<div class="summary-item">
                        <span>${status}</span>
                        <span>${count}</span>
                    </div>`
                ).join('')}
            </div>
            <div class="summary-section">
                <h3>Kategori Aset:</h3>
                ${Object.entries(categoryCounts).map(([category, count]) => 
                    `<div class="summary-item">
                        <span>${category}</span>
                        <span>${count}</span>
                    </div>`
                ).join('')}
            </div>
        </div>
    </div>

    <div class="table-container">
        <h2>DETAIL ASET</h2>
        <table>
            <thead>
                <tr>
                    <th>Nomor Aset</th>
                    <th>Nomor Inventaris</th>
                    <th>Kategori</th>
                    <th>Merek</th>
                    <th>Tipe</th>
                    <th>Status</th>
                    <th>Pengguna</th>
                    <th>Unit</th>
                    <th>Lokasi</th>
                    <th>Tanggal Beli</th>
                    <th>Garansi</th>
                </tr>
            </thead>
            <tbody>
                ${assets.map(asset => `
                    <tr>
                        <td>${asset.asset_number || ''}</td>
                        <td>${asset.inventory_number || '-'}</td>
                        <td>${CATEGORY_MAPPING[asset.category] || asset.category}</td>
                        <td>${asset.equipment_brand || '-'}</td>
                        <td>${asset.equipment_type || '-'}</td>
                        <td>${STATUS_MAPPING[asset.status] || asset.status}</td>
                        <td>${asset.user_name || '-'}</td>
                        <td>${asset.user_unit || '-'}</td>
                        <td>${asset.user_location || '-'}</td>
                        <td>${asset.purchase_date || '-'}</td>
                        <td>${asset.warranty_date || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>Laporan dibuat pada ${formatDate(new Date())}</p>
    </div>
</body>
</html>`;
    
    // Write HTML file (can be printed to PDF or viewed in browser)
    await fs.writeFile(filepath, htmlContent, 'utf8');
    
    return { file_url: `/downloads/${filename}` };
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}