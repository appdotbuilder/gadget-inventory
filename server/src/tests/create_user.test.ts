import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { createUser } from '../handlers/create_user';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateUserInput = {
  nik: '1234567890123456',
  name: 'John Doe',
  position: 'Software Engineer',
  unit: 'IT Department',
  location: 'Jakarta',
  user_type: 'user'
};

describe('createUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a user with all fields', async () => {
    const result = await createUser(testInput);

    // Validate all fields are correctly set
    expect(result.nik).toEqual('1234567890123456');
    expect(result.name).toEqual('John Doe');
    expect(result.position).toEqual('Software Engineer');
    expect(result.unit).toEqual('IT Department');
    expect(result.location).toEqual('Jakarta');
    expect(result.user_type).toEqual('user');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database', async () => {
    const result = await createUser(testInput);

    // Query database to verify user was saved
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.id))
      .execute();

    expect(users).toHaveLength(1);
    expect(users[0].nik).toEqual('1234567890123456');
    expect(users[0].name).toEqual('John Doe');
    expect(users[0].position).toEqual('Software Engineer');
    expect(users[0].unit).toEqual('IT Department');
    expect(users[0].location).toEqual('Jakarta');
    expect(users[0].user_type).toEqual('user');
    expect(users[0].created_at).toBeInstanceOf(Date);
    expect(users[0].updated_at).toBeInstanceOf(Date);
  });

  it('should create admin user type', async () => {
    const adminInput: CreateUserInput = {
      ...testInput,
      nik: '9876543210987654',
      name: 'Jane Admin',
      user_type: 'admin'
    };

    const result = await createUser(adminInput);

    expect(result.user_type).toEqual('admin');
    expect(result.name).toEqual('Jane Admin');
    expect(result.nik).toEqual('9876543210987654');
  });

  it('should create multiple users with different NIKs', async () => {
    const user1Input: CreateUserInput = {
      ...testInput,
      nik: '1111111111111111',
      name: 'User One'
    };

    const user2Input: CreateUserInput = {
      ...testInput,
      nik: '2222222222222222',
      name: 'User Two'
    };

    const result1 = await createUser(user1Input);
    const result2 = await createUser(user2Input);

    expect(result1.nik).toEqual('1111111111111111');
    expect(result2.nik).toEqual('2222222222222222');
    expect(result1.id).not.toEqual(result2.id);

    // Verify both users exist in database
    const allUsers = await db.select().from(usersTable).execute();
    expect(allUsers).toHaveLength(2);
  });

  it('should enforce unique NIK constraint', async () => {
    // Create first user
    await createUser(testInput);

    // Attempt to create second user with same NIK
    const duplicateInput: CreateUserInput = {
      ...testInput,
      name: 'Different Name'
    };

    // Should throw error due to unique constraint
    await expect(createUser(duplicateInput)).rejects.toThrow();
  });

  it('should handle various location and unit combinations', async () => {
    const testCases = [
      { location: 'Surabaya', unit: 'Finance Department' },
      { location: 'Bandung', unit: 'Human Resources' },
      { location: 'Medan', unit: 'Marketing' }
    ];

    for (let i = 0; i < testCases.length; i++) {
      const input: CreateUserInput = {
        ...testInput,
        nik: `${1000000000000000 + i}`,
        name: `Test User ${i + 1}`,
        location: testCases[i].location,
        unit: testCases[i].unit
      };

      const result = await createUser(input);
      expect(result.location).toEqual(testCases[i].location);
      expect(result.unit).toEqual(testCases[i].unit);
    }

    // Verify all users were created
    const allUsers = await db.select().from(usersTable).execute();
    expect(allUsers).toHaveLength(testCases.length);
  });
});