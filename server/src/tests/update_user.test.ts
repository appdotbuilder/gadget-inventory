import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type UpdateUserInput, type CreateUserInput } from '../schema';
import { updateUser } from '../handlers/update_user';
import { eq } from 'drizzle-orm';

// Create test user first
const createTestUser = async (): Promise<number> => {
  const testUserInput: CreateUserInput = {
    nik: '1234567890',
    name: 'Test User',
    position: 'Developer',
    unit: 'IT',
    location: 'Jakarta',
    user_type: 'user'
  };

  const result = await db.insert(usersTable)
    .values(testUserInput)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all user fields', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      nik: '0987654321',
      name: 'Updated User',
      position: 'Senior Developer',
      unit: 'Engineering',
      location: 'Bandung',
      user_type: 'admin'
    };

    const result = await updateUser(updateInput);

    // Verify all fields are updated
    expect(result.id).toEqual(userId);
    expect(result.nik).toEqual('0987654321');
    expect(result.name).toEqual('Updated User');
    expect(result.position).toEqual('Senior Developer');
    expect(result.unit).toEqual('Engineering');
    expect(result.location).toEqual('Bandung');
    expect(result.user_type).toEqual('admin');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update partial user fields', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      name: 'Partially Updated User',
      position: 'Lead Developer'
    };

    const result = await updateUser(updateInput);

    // Verify only specified fields are updated, others remain unchanged
    expect(result.id).toEqual(userId);
    expect(result.nik).toEqual('1234567890'); // Original value
    expect(result.name).toEqual('Partially Updated User'); // Updated
    expect(result.position).toEqual('Lead Developer'); // Updated
    expect(result.unit).toEqual('IT'); // Original value
    expect(result.location).toEqual('Jakarta'); // Original value
    expect(result.user_type).toEqual('user'); // Original value
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only user_type', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      user_type: 'admin'
    };

    const result = await updateUser(updateInput);

    // Verify only user_type is updated
    expect(result.id).toEqual(userId);
    expect(result.nik).toEqual('1234567890'); // Original value
    expect(result.name).toEqual('Test User'); // Original value
    expect(result.position).toEqual('Developer'); // Original value
    expect(result.unit).toEqual('IT'); // Original value
    expect(result.location).toEqual('Jakarta'); // Original value
    expect(result.user_type).toEqual('admin'); // Updated
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated user to database', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId,
      name: 'Database Test User',
      unit: 'QA'
    };

    await updateUser(updateInput);

    // Verify changes are persisted in database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].name).toEqual('Database Test User');
    expect(users[0].unit).toEqual('QA');
    expect(users[0].nik).toEqual('1234567890'); // Unchanged
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when user does not exist', async () => {
    const updateInput: UpdateUserInput = {
      id: 99999, // Non-existent ID
      name: 'Non-existent User'
    };

    await expect(updateUser(updateInput)).rejects.toThrow(/User with id 99999 not found/i);
  });

  it('should handle unique constraint violation on nik', async () => {
    // Create first user
    const userId1 = await createTestUser();
    
    // Create second user with different nik
    const testUserInput2: CreateUserInput = {
      nik: '5555555555',
      name: 'Second User',
      position: 'Tester',
      unit: 'QA',
      location: 'Surabaya',
      user_type: 'user'
    };

    const result2 = await db.insert(usersTable)
      .values(testUserInput2)
      .returning()
      .execute();

    const userId2 = result2[0].id;

    // Try to update second user with first user's nik
    const updateInput: UpdateUserInput = {
      id: userId2,
      nik: '1234567890' // This NIK already exists for userId1
    };

    // Should throw unique constraint violation
    await expect(updateUser(updateInput)).rejects.toThrow();
  });

  it('should update updated_at timestamp', async () => {
    const userId = await createTestUser();

    // Get original timestamp
    const originalUser = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    const originalUpdatedAt = originalUser[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateUserInput = {
      id: userId,
      name: 'Timestamp Test User'
    };

    const result = await updateUser(updateInput);

    // Verify updated_at is changed
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should handle empty update gracefully', async () => {
    const userId = await createTestUser();

    const updateInput: UpdateUserInput = {
      id: userId
      // No fields to update
    };

    const result = await updateUser(updateInput);

    // Verify user is returned with only updated_at changed
    expect(result.id).toEqual(userId);
    expect(result.nik).toEqual('1234567890');
    expect(result.name).toEqual('Test User');
    expect(result.position).toEqual('Developer');
    expect(result.unit).toEqual('IT');
    expect(result.location).toEqual('Jakarta');
    expect(result.user_type).toEqual('user');
    expect(result.updated_at).toBeInstanceOf(Date);
  });
});