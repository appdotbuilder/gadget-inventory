import { z } from 'zod';

// User types enum
export const userTypeSchema = z.enum(['admin', 'user']);
export type UserType = z.infer<typeof userTypeSchema>;

// Asset status enum
export const assetStatusSchema = z.enum(['baik', 'rusak', 'perbaikan', 'hilang']);
export type AssetStatus = z.infer<typeof assetStatusSchema>;

// Asset category enum (common gadget categories)
export const assetCategorySchema = z.enum([
  'smartphone',
  'tablet',
  'laptop',
  'desktop',
  'printer',
  'scanner',
  'router',
  'switch',
  'access_point',
  'other'
]);
export type AssetCategory = z.infer<typeof assetCategorySchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  nik: z.string(),
  name: z.string(),
  position: z.string(),
  unit: z.string(),
  location: z.string(),
  user_type: userTypeSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Asset schema with all required fields
export const assetSchema = z.object({
  id: z.number(),
  user_nik: z.string().nullable(),
  user_name: z.string().nullable(),
  user_position: z.string().nullable(),
  user_unit: z.string().nullable(),
  user_location: z.string().nullable(),
  asset_number: z.string(),
  inventory_number: z.string().nullable(),
  imei_number: z.string().nullable(),
  serial_number: z.string().nullable(),
  wifi_mac_address: z.string().nullable(),
  purchase_date: z.string().nullable(), // Store as YYYY-MM-DD string
  warranty_date: z.string().nullable(), // Store as YYYY-MM-DD string
  category: assetCategorySchema,
  equipment_brand: z.string().nullable(),
  equipment_type: z.string().nullable(),
  supplier: z.string().nullable(),
  apk_harv: z.string().nullable(),
  apk_upk: z.string().nullable(),
  apk_nurs: z.string().nullable(),
  uuid_harvesting: z.string().nullable(),
  uuid_upkeep: z.string().nullable(),
  uuid_nursery: z.string().nullable(),
  code_harvesting: z.string().nullable(),
  code_upkeep: z.string().nullable(),
  code_nursery: z.string().nullable(),
  code_replanting: z.string().nullable(),
  user_id_efact: z.string().nullable(),
  status: assetStatusSchema,
  notes: z.string().nullable(),
  repair_location: z.string().nullable(),
  sent_to_regmis: z.boolean(),
  sent_to_jkto: z.boolean(),
  recommendation_number: z.string().nullable(),
  gadget_usage: z.string().nullable(),
  qr_code: z.string().nullable(), // For QR code scanning
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Asset = z.infer<typeof assetSchema>;

// Input schemas for user operations
export const createUserInputSchema = z.object({
  nik: z.string().min(1),
  name: z.string().min(1),
  position: z.string().min(1),
  unit: z.string().min(1),
  location: z.string().min(1),
  user_type: userTypeSchema
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  nik: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  user_type: userTypeSchema.optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Input schemas for asset operations
export const createAssetInputSchema = z.object({
  user_nik: z.string().nullable(),
  user_name: z.string().nullable(),
  user_position: z.string().nullable(),
  user_unit: z.string().nullable(),
  user_location: z.string().nullable(),
  asset_number: z.string().min(1),
  inventory_number: z.string().nullable(),
  imei_number: z.string().nullable(),
  serial_number: z.string().nullable(),
  wifi_mac_address: z.string().nullable(),
  purchase_date: z.string().nullable(),
  warranty_date: z.string().nullable(),
  category: assetCategorySchema,
  equipment_brand: z.string().nullable(),
  equipment_type: z.string().nullable(),
  supplier: z.string().nullable(),
  apk_harv: z.string().nullable(),
  apk_upk: z.string().nullable(),
  apk_nurs: z.string().nullable(),
  uuid_harvesting: z.string().nullable(),
  uuid_upkeep: z.string().nullable(),
  uuid_nursery: z.string().nullable(),
  code_harvesting: z.string().nullable(),
  code_upkeep: z.string().nullable(),
  code_nursery: z.string().nullable(),
  code_replanting: z.string().nullable(),
  user_id_efact: z.string().nullable(),
  status: assetStatusSchema,
  notes: z.string().nullable(),
  repair_location: z.string().nullable(),
  sent_to_regmis: z.boolean().default(false),
  sent_to_jkto: z.boolean().default(false),
  recommendation_number: z.string().nullable(),
  gadget_usage: z.string().nullable()
});

export type CreateAssetInput = z.infer<typeof createAssetInputSchema>;

export const updateAssetInputSchema = z.object({
  id: z.number(),
  user_nik: z.string().nullable().optional(),
  user_name: z.string().nullable().optional(),
  user_position: z.string().nullable().optional(),
  user_unit: z.string().nullable().optional(),
  user_location: z.string().nullable().optional(),
  asset_number: z.string().min(1).optional(),
  inventory_number: z.string().nullable().optional(),
  imei_number: z.string().nullable().optional(),
  serial_number: z.string().nullable().optional(),
  wifi_mac_address: z.string().nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  warranty_date: z.string().nullable().optional(),
  category: assetCategorySchema.optional(),
  equipment_brand: z.string().nullable().optional(),
  equipment_type: z.string().nullable().optional(),
  supplier: z.string().nullable().optional(),
  apk_harv: z.string().nullable().optional(),
  apk_upk: z.string().nullable().optional(),
  apk_nurs: z.string().nullable().optional(),
  uuid_harvesting: z.string().nullable().optional(),
  uuid_upkeep: z.string().nullable().optional(),
  uuid_nursery: z.string().nullable().optional(),
  code_harvesting: z.string().nullable().optional(),
  code_upkeep: z.string().nullable().optional(),
  code_nursery: z.string().nullable().optional(),
  code_replanting: z.string().nullable().optional(),
  user_id_efact: z.string().nullable().optional(),
  status: assetStatusSchema.optional(),
  notes: z.string().nullable().optional(),
  repair_location: z.string().nullable().optional(),
  sent_to_regmis: z.boolean().optional(),
  sent_to_jkto: z.boolean().optional(),
  recommendation_number: z.string().nullable().optional(),
  gadget_usage: z.string().nullable().optional()
});

export type UpdateAssetInput = z.infer<typeof updateAssetInputSchema>;

// Search and filter schemas
export const assetSearchInputSchema = z.object({
  search_term: z.string().optional(),
  category: assetCategorySchema.optional(),
  status: assetStatusSchema.optional(),
  user_unit: z.string().optional(),
  user_location: z.string().optional(),
  equipment_brand: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20)
});

export type AssetSearchInput = z.infer<typeof assetSearchInputSchema>;

// Dashboard statistics schema
export const dashboardStatsSchema = z.object({
  total_assets: z.number(),
  assets_by_category: z.record(z.string(), z.number()),
  assets_by_status: z.record(z.string(), z.number()),
  assets_by_location: z.record(z.string(), z.number()),
  warranty_expiring_soon: z.number(),
  assets_in_repair: z.number()
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// QR Code scan input schema
export const qrCodeScanInputSchema = z.object({
  qr_code: z.string().min(1)
});

export type QrCodeScanInput = z.infer<typeof qrCodeScanInputSchema>;

// Notification schema
export const notificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['warranty_expiring', 'repair_reminder', 'general']),
  asset_id: z.number().nullable(),
  is_read: z.boolean(),
  created_at: z.coerce.date()
});

export type Notification = z.infer<typeof notificationSchema>;

export const createNotificationInputSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['warranty_expiring', 'repair_reminder', 'general']),
  asset_id: z.number().nullable()
});

export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;