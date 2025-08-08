import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  updateUserInputSchema,
  createAssetInputSchema,
  updateAssetInputSchema,
  assetSearchInputSchema,
  qrCodeScanInputSchema,
  createNotificationInputSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUsers, getUserByNik } from './handlers/get_users';
import { updateUser } from './handlers/update_user';
import { deleteUser } from './handlers/delete_user';

import { createAsset } from './handlers/create_asset';
import { getAssets, getAssetById, searchAssets } from './handlers/get_assets';
import { updateAsset } from './handlers/update_asset';
import { deleteAsset } from './handlers/delete_asset';

import { scanQrCode } from './handlers/scan_qr_code';
import { getDashboardStats } from './handlers/get_dashboard_stats';
import { exportToExcel, exportToPdf } from './handlers/export_data';

import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from './handlers/get_notifications';
import {
  createNotification,
  generateWarrantyNotifications,
  generateRepairReminders
} from './handlers/create_notification';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management routes (Admin only in real implementation)
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  getUsers: publicProcedure
    .query(() => getUsers()),

  getUserByNik: publicProcedure
    .input(z.object({ nik: z.string() }))
    .query(({ input }) => getUserByNik(input.nik)),

  updateUser: publicProcedure
    .input(updateUserInputSchema)
    .mutation(({ input }) => updateUser(input)),

  deleteUser: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteUser(input.id)),

  // Asset management routes
  createAsset: publicProcedure
    .input(createAssetInputSchema)
    .mutation(({ input }) => createAsset(input)),

  getAssets: publicProcedure
    .query(() => getAssets()),

  getAssetById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getAssetById(input.id)),

  searchAssets: publicProcedure
    .input(assetSearchInputSchema)
    .query(({ input }) => searchAssets(input)),

  updateAsset: publicProcedure
    .input(updateAssetInputSchema)
    .mutation(({ input }) => updateAsset(input)),

  deleteAsset: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteAsset(input.id)),

  // QR Code scanning
  scanQrCode: publicProcedure
    .input(qrCodeScanInputSchema)
    .query(({ input }) => scanQrCode(input)),

  // Dashboard and statistics
  getDashboardStats: publicProcedure
    .query(() => getDashboardStats()),

  // Data export
  exportToExcel: publicProcedure
    .mutation(() => exportToExcel()),

  exportToPdf: publicProcedure
    .mutation(() => exportToPdf()),

  // Notifications
  getNotifications: publicProcedure
    .query(() => getNotifications()),

  getUnreadNotifications: publicProcedure
    .query(() => getUnreadNotifications()),

  markNotificationAsRead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => markNotificationAsRead(input.id)),

  markAllNotificationsAsRead: publicProcedure
    .mutation(() => markAllNotificationsAsRead()),

  createNotification: publicProcedure
    .input(createNotificationInputSchema)
    .mutation(({ input }) => createNotification(input)),

  // Automated notification generators (should be called by cron jobs)
  generateWarrantyNotifications: publicProcedure
    .mutation(() => generateWarrantyNotifications()),

  generateRepairReminders: publicProcedure
    .mutation(() => generateRepairReminders()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();