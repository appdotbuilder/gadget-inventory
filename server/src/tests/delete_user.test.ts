import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { deleteUser } from '../handlers/delete_user';

// Test data for creating users
const testUser1 = {
  nik: 'TEST001',
  name: 'John Doe',
  position: 'Developer',
  unit: 'IT Department',
  location: 'Jakarta',
  user_type: 'user' as const
};

const testUser2 = {
  nik: 'TEST002',
  name: 'Jane Smith',
  position: 'Manager',
  unit: 'HR Department',
  location: 'Bandung',
  user_type: 'admin' as const
};

describe('deleteUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing user successfully', async () => {
    // Create a test user first
    const createdUsers = await db.insert(usersTable)
      .values(testUser1)
      .returning()
      .execute();

    const userId = createdUsers[0].id;

    // Delete the user
    const result = await deleteUser(userId);

    // Verify the result
    expect(result.success).toBe(true);

    // Verify user is actually deleted from database
    const deletedUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(deletedUser).toHaveLength(0);
  });

  it('should throw error when trying to delete non-existent user', async () => {
    const nonExistentId = 999;

    // Try to delete non-existent user
    await expect(deleteUser(nonExistentId)).rejects.toThrow(/User with id 999 not found/i);

    // Verify database is unchanged
    const allUsers = await db.select()
      .from(usersTable)
      .execute();

    expect(allUsers).toHaveLength(0);
  });

  it('should only delete the specified user and leave others intact', async () => {
    // Create multiple test users
    const createdUsers = await db.insert(usersTable)
      .values([testUser1, testUser2])
      .returning()
      .execute();

    const user1Id = createdUsers[0].id;
    const user2Id = createdUsers[1].id;

    // Delete only the first user
    const result = await deleteUser(user1Id);

    // Verify deletion was successful
    expect(result.success).toBe(true);

    // Verify first user is deleted
    const deletedUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, user1Id))
      .execute();

    expect(deletedUser).toHaveLength(0);

    // Verify second user still exists
    const remainingUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, user2Id))
      .execute();

    expect(remainingUser).toHaveLength(1);
    expect(remainingUser[0].name).toEqual('Jane Smith');
    expect(remainingUser[0].nik).toEqual('TEST002');
  });

  it('should handle edge case with id 0', async () => {
    // Try to delete user with id 0 (which shouldn't exist due to serial primary key)
    await expect(deleteUser(0)).rejects.toThrow(/User with id 0 not found/i);
  });

  it('should handle negative id values', async () => {
    // Try to delete user with negative id
    await expect(deleteUser(-1)).rejects.toThrow(/User with id -1 not found/i);
  });

  it('should verify user exists before attempting deletion', async () => {
    // Create and then manually delete a user to test the existence check
    const createdUsers = await db.insert(usersTable)
      .values(testUser1)
      .returning()
      .execute();

    const userId = createdUsers[0].id;

    // Manually delete the user directly from database
    await db.delete(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    // Now try to delete the same user through the handler
    await expect(deleteUser(userId)).rejects.toThrow(/User with id .* not found/i);
  });
});