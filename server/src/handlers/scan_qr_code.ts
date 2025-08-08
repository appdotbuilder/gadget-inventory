import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type QrCodeScanInput, type Asset } from '../schema';
import { eq } from 'drizzle-orm';

export async function scanQrCode(input: QrCodeScanInput): Promise<Asset | null> {
  try {
    // Query for asset with matching QR code
    const results = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.qr_code, input.qr_code))
      .limit(1)
      .execute();

    // Return null if no asset found
    if (results.length === 0) {
      return null;
    }

    // Return the asset data - no numeric fields to convert in this schema
    return results[0];
  } catch (error) {
    console.error('QR code scan failed:', error);
    throw error;
  }
}