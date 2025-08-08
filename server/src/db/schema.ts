import { serial, text, pgTable, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userTypeEnum = pgEnum('user_type', ['admin', 'user']);
export const assetStatusEnum = pgEnum('asset_status', ['baik', 'rusak', 'perbaikan', 'hilang']);
export const assetCategoryEnum = pgEnum('asset_category', [
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
export const notificationTypeEnum = pgEnum('notification_type', [
  'warranty_expiring',
  'repair_reminder',
  'general'
]);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  nik: text('nik').notNull().unique(),
  name: text('name').notNull(),
  position: text('position').notNull(),
  unit: text('unit').notNull(),
  location: text('location').notNull(),
  user_type: userTypeEnum('user_type').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Assets table with all required fields
export const assetsTable = pgTable('assets', {
  id: serial('id').primaryKey(),
  user_nik: text('user_nik'), // Nullable - asset might not be assigned to a user
  user_name: text('user_name'),
  user_position: text('user_position'),
  user_unit: text('user_unit'),
  user_location: text('user_location'),
  asset_number: text('asset_number').notNull().unique(),
  inventory_number: text('inventory_number'),
  imei_number: text('imei_number'),
  serial_number: text('serial_number'),
  wifi_mac_address: text('wifi_mac_address'),
  purchase_date: text('purchase_date'), // Store as YYYY-MM-DD string
  warranty_date: text('warranty_date'), // Store as YYYY-MM-DD string
  category: assetCategoryEnum('category').notNull(),
  equipment_brand: text('equipment_brand'),
  equipment_type: text('equipment_type'),
  supplier: text('supplier'),
  apk_harv: text('apk_harv'),
  apk_upk: text('apk_upk'),
  apk_nurs: text('apk_nurs'),
  uuid_harvesting: text('uuid_harvesting'),
  uuid_upkeep: text('uuid_upkeep'),
  uuid_nursery: text('uuid_nursery'),
  code_harvesting: text('code_harvesting'),
  code_upkeep: text('code_upkeep'),
  code_nursery: text('code_nursery'),
  code_replanting: text('code_replanting'),
  user_id_efact: text('user_id_efact'),
  status: assetStatusEnum('status').notNull(),
  notes: text('notes'),
  repair_location: text('repair_location'),
  sent_to_regmis: boolean('sent_to_regmis').default(false).notNull(),
  sent_to_jkto: boolean('sent_to_jkto').default(false).notNull(),
  recommendation_number: text('recommendation_number'),
  gadget_usage: text('gadget_usage'),
  qr_code: text('qr_code').unique(), // For QR code scanning
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Notifications table
export const notificationsTable = pgTable('notifications', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: notificationTypeEnum('type').notNull(),
  asset_id: serial('asset_id'), // Reference to asset, nullable
  is_read: boolean('is_read').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  // Users don't have direct foreign key relations with assets since user_nik is stored as text
}));

export const assetsRelations = relations(assetsTable, ({ many }) => ({
  notifications: many(notificationsTable)
}));

export const notificationsRelations = relations(notificationsTable, ({ one }) => ({
  asset: one(assetsTable, {
    fields: [notificationsTable.asset_id],
    references: [assetsTable.id]
  })
}));

// TypeScript types for the tables
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Asset = typeof assetsTable.$inferSelect;
export type NewAsset = typeof assetsTable.$inferInsert;

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  assets: assetsTable,
  notifications: notificationsTable
};