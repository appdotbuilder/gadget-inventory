import { db } from '../db';
import { assetsTable } from '../db/schema';
import { type UpdateAssetInput, type Asset } from '../schema';
import { eq } from 'drizzle-orm';

export const updateAsset = async (input: UpdateAssetInput): Promise<Asset> => {
  try {
    // First, check if the asset exists
    const existingAsset = await db.select()
      .from(assetsTable)
      .where(eq(assetsTable.id, input.id))
      .limit(1)
      .execute();

    if (existingAsset.length === 0) {
      throw new Error(`Asset with id ${input.id} not found`);
    }

    // Build update data - only include fields that are provided in input
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };

    // Add all optional fields that are provided
    if (input.user_nik !== undefined) updateData['user_nik'] = input.user_nik;
    if (input.user_name !== undefined) updateData['user_name'] = input.user_name;
    if (input.user_position !== undefined) updateData['user_position'] = input.user_position;
    if (input.user_unit !== undefined) updateData['user_unit'] = input.user_unit;
    if (input.user_location !== undefined) updateData['user_location'] = input.user_location;
    if (input.asset_number !== undefined) updateData['asset_number'] = input.asset_number;
    if (input.inventory_number !== undefined) updateData['inventory_number'] = input.inventory_number;
    if (input.imei_number !== undefined) updateData['imei_number'] = input.imei_number;
    if (input.serial_number !== undefined) updateData['serial_number'] = input.serial_number;
    if (input.wifi_mac_address !== undefined) updateData['wifi_mac_address'] = input.wifi_mac_address;
    if (input.purchase_date !== undefined) updateData['purchase_date'] = input.purchase_date;
    if (input.warranty_date !== undefined) updateData['warranty_date'] = input.warranty_date;
    if (input.category !== undefined) updateData['category'] = input.category;
    if (input.equipment_brand !== undefined) updateData['equipment_brand'] = input.equipment_brand;
    if (input.equipment_type !== undefined) updateData['equipment_type'] = input.equipment_type;
    if (input.supplier !== undefined) updateData['supplier'] = input.supplier;
    if (input.apk_harv !== undefined) updateData['apk_harv'] = input.apk_harv;
    if (input.apk_upk !== undefined) updateData['apk_upk'] = input.apk_upk;
    if (input.apk_nurs !== undefined) updateData['apk_nurs'] = input.apk_nurs;
    if (input.uuid_harvesting !== undefined) updateData['uuid_harvesting'] = input.uuid_harvesting;
    if (input.uuid_upkeep !== undefined) updateData['uuid_upkeep'] = input.uuid_upkeep;
    if (input.uuid_nursery !== undefined) updateData['uuid_nursery'] = input.uuid_nursery;
    if (input.code_harvesting !== undefined) updateData['code_harvesting'] = input.code_harvesting;
    if (input.code_upkeep !== undefined) updateData['code_upkeep'] = input.code_upkeep;
    if (input.code_nursery !== undefined) updateData['code_nursery'] = input.code_nursery;
    if (input.code_replanting !== undefined) updateData['code_replanting'] = input.code_replanting;
    if (input.user_id_efact !== undefined) updateData['user_id_efact'] = input.user_id_efact;
    if (input.status !== undefined) updateData['status'] = input.status;
    if (input.notes !== undefined) updateData['notes'] = input.notes;
    if (input.repair_location !== undefined) updateData['repair_location'] = input.repair_location;
    if (input.sent_to_regmis !== undefined) updateData['sent_to_regmis'] = input.sent_to_regmis;
    if (input.sent_to_jkto !== undefined) updateData['sent_to_jkto'] = input.sent_to_jkto;
    if (input.recommendation_number !== undefined) updateData['recommendation_number'] = input.recommendation_number;
    if (input.gadget_usage !== undefined) updateData['gadget_usage'] = input.gadget_usage;

    // Update the asset
    const result = await db.update(assetsTable)
      .set(updateData)
      .where(eq(assetsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Failed to update asset with id ${input.id}`);
    }

    return result[0];
  } catch (error) {
    console.error('Asset update failed:', error);
    throw error;
  }
};