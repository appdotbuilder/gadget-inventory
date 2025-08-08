import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type CreateAssetInput, type Asset } from '../schema';
import { randomUUID } from 'crypto';

export const createAsset = async (input: CreateAssetInput): Promise<Asset> => {
  try {
    // Generate unique QR code using UUID
    const qrCode = `QR_${randomUUID()}`;
    
    // Insert asset record
    const result = await db.insert(assetsTable)
      .values({
        user_nik: input.user_nik,
        user_name: input.user_name,
        user_position: input.user_position,
        user_unit: input.user_unit,
        user_location: input.user_location,
        asset_number: input.asset_number,
        inventory_number: input.inventory_number,
        imei_number: input.imei_number,
        serial_number: input.serial_number,
        wifi_mac_address: input.wifi_mac_address,
        purchase_date: input.purchase_date,
        warranty_date: input.warranty_date,
        category: input.category,
        equipment_brand: input.equipment_brand,
        equipment_type: input.equipment_type,
        supplier: input.supplier,
        apk_harv: input.apk_harv,
        apk_upk: input.apk_upk,
        apk_nurs: input.apk_nurs,
        uuid_harvesting: input.uuid_harvesting,
        uuid_upkeep: input.uuid_upkeep,
        uuid_nursery: input.uuid_nursery,
        code_harvesting: input.code_harvesting,
        code_upkeep: input.code_upkeep,
        code_nursery: input.code_nursery,
        code_replanting: input.code_replanting,
        user_id_efact: input.user_id_efact,
        status: input.status,
        notes: input.notes,
        repair_location: input.repair_location,
        sent_to_regmis: input.sent_to_regmis,
        sent_to_jkto: input.sent_to_jkto,
        recommendation_number: input.recommendation_number,
        gadget_usage: input.gadget_usage,
        qr_code: qrCode
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Asset creation failed:', error);
    throw error;
  }
};