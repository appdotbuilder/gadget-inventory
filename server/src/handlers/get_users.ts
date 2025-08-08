import { db } from '../db';
import { usersTable } from '../db/schema';
import { type User } from '../schema';
import { eq, ilike, or, and, desc } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

// Input types for getUsers function
export interface GetUsersOptions {
  search?: string;
  user_type?: 'admin' | 'user';
  unit?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export async function getUsers(options: GetUsersOptions = {}): Promise<User[]> {
  try {
    const {
      search,
      user_type,
      unit,
      location,
      page = 1,
      limit = 20
    } = options;

    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Search across multiple fields
    if (search) {
      conditions.push(
        or(
          ilike(usersTable.name, `%${search}%`),
          ilike(usersTable.nik, `%${search}%`),
          ilike(usersTable.position, `%${search}%`),
          ilike(usersTable.unit, `%${search}%`),
          ilike(usersTable.location, `%${search}%`)
        )!
      );
    }

    // Filter by user type
    if (user_type) {
      conditions.push(eq(usersTable.user_type, user_type));
    }

    // Filter by unit
    if (unit) {
      conditions.push(eq(usersTable.unit, unit));
    }

    // Filter by location
    if (location) {
      conditions.push(eq(usersTable.location, location));
    }

    // Calculate pagination offset
    const offset = (page - 1) * limit;

    // Build and execute query based on whether we have conditions
    let results;
    if (conditions.length > 0) {
      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
      results = await db.select()
        .from(usersTable)
        .where(whereClause)
        .orderBy(desc(usersTable.created_at))
        .limit(limit)
        .offset(offset)
        .execute();
    } else {
      results = await db.select()
        .from(usersTable)
        .orderBy(desc(usersTable.created_at))
        .limit(limit)
        .offset(offset)
        .execute();
    }

    return results;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}

export async function getUserByNik(nik: string): Promise<User | null> {
  try {
    const results = await db.select()
      .from(usersTable)
      .where(eq(usersTable.nik, nik))
      .limit(1)
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to fetch user by NIK:', error);
    throw error;
  }
}