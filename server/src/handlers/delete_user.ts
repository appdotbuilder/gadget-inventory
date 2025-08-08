import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function deleteUser(id: number): Promise<{ success: boolean }> {
  try {
    // Check if user exists first
    const existingUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .execute();

    if (existingUser.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }

    // Delete the user
    const result = await db.delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning()
      .execute();

    // Verify deletion was successful
    if (result.length === 0) {
      throw new Error(`Failed to delete user with id ${id}`);
    }

    return { success: true };
  } catch (error) {
    console.error('User deletion failed:', error);
    throw error;
  }
}