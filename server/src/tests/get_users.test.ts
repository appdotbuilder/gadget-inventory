import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput } from '../schema';
import { getUsers, getUserByNik, type GetUsersOptions } from '../handlers/get_users';

// Test data
const testUsers: CreateUserInput[] = [
  {
    nik: '123456789',
    name: 'John Doe',
    position: 'Manager',
    unit: 'IT Department',
    location: 'Jakarta',
    user_type: 'admin'
  },
  {
    nik: '987654321',
    name: 'Jane Smith',
    position: 'Developer',
    unit: 'IT Department',
    location: 'Jakarta',
    user_type: 'user'
  },
  {
    nik: '555666777',
    name: 'Bob Wilson',
    position: 'Analyst',
    unit: 'Finance Department',
    location: 'Surabaya',
    user_type: 'user'
  },
  {
    nik: '111222333',
    name: 'Alice Brown',
    position: 'Supervisor',
    unit: 'HR Department',
    location: 'Bandung',
    user_type: 'admin'
  }
];

describe('getUsers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  beforeEach(async () => {
    // Insert test users
    for (const user of testUsers) {
      await db.insert(usersTable).values({
        ...user,
        created_at: new Date(),
        updated_at: new Date()
      }).execute();
    }
  });

  it('should return all users when no filters applied', async () => {
    const result = await getUsers();

    expect(result).toHaveLength(4);
    expect(result[0].name).toBeDefined();
    expect(result[0].nik).toBeDefined();
    expect(result[0].position).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should filter users by search term (name)', async () => {
    const options: GetUsersOptions = {
      search: 'John'
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('John Doe');
    expect(result[0].nik).toEqual('123456789');
  });

  it('should filter users by search term (NIK)', async () => {
    const options: GetUsersOptions = {
      search: '987654321'
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Jane Smith');
    expect(result[0].nik).toEqual('987654321');
  });

  it('should filter users by search term (position)', async () => {
    const options: GetUsersOptions = {
      search: 'Developer'
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Jane Smith');
    expect(result[0].position).toEqual('Developer');
  });

  it('should filter users by user_type', async () => {
    const options: GetUsersOptions = {
      user_type: 'admin'
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(2);
    result.forEach(user => {
      expect(user.user_type).toEqual('admin');
    });
  });

  it('should filter users by unit', async () => {
    const options: GetUsersOptions = {
      unit: 'IT Department'
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(2);
    result.forEach(user => {
      expect(user.unit).toEqual('IT Department');
    });
  });

  it('should filter users by location', async () => {
    const options: GetUsersOptions = {
      location: 'Jakarta'
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(2);
    result.forEach(user => {
      expect(user.location).toEqual('Jakarta');
    });
  });

  it('should apply pagination correctly', async () => {
    const options: GetUsersOptions = {
      page: 1,
      limit: 2
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(2);
  });

  it('should return second page of results', async () => {
    const page1Options: GetUsersOptions = {
      page: 1,
      limit: 2
    };

    const page2Options: GetUsersOptions = {
      page: 2,
      limit: 2
    };

    const page1Result = await getUsers(page1Options);
    const page2Result = await getUsers(page2Options);

    expect(page1Result).toHaveLength(2);
    expect(page2Result).toHaveLength(2);
    
    // Ensure different users on different pages
    const page1Niks = page1Result.map(u => u.nik);
    const page2Niks = page2Result.map(u => u.nik);
    
    expect(page1Niks).not.toEqual(page2Niks);
  });

  it('should combine multiple filters', async () => {
    const options: GetUsersOptions = {
      user_type: 'user',
      location: 'Jakarta'
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Jane Smith');
    expect(result[0].user_type).toEqual('user');
    expect(result[0].location).toEqual('Jakarta');
  });

  it('should return empty array when no matches found', async () => {
    const options: GetUsersOptions = {
      search: 'NonExistentUser'
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(0);
  });

  it('should handle case-insensitive search', async () => {
    const options: GetUsersOptions = {
      search: 'john'
    };

    const result = await getUsers(options);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('John Doe');
  });

  it('should order results by creation date descending', async () => {
    // Create users with specific timestamps
    await resetDB();
    await createDB();

    // Insert users with delay to ensure different timestamps
    await db.insert(usersTable).values({
      ...testUsers[0],
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01')
    }).execute();

    await db.insert(usersTable).values({
      ...testUsers[1],
      created_at: new Date('2024-01-02'),
      updated_at: new Date('2024-01-02')
    }).execute();

    const result = await getUsers();

    expect(result).toHaveLength(2);
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });
});

describe('getUserByNik', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  beforeEach(async () => {
    // Insert test users
    for (const user of testUsers) {
      await db.insert(usersTable).values({
        ...user,
        created_at: new Date(),
        updated_at: new Date()
      }).execute();
    }
  });

  it('should return user when NIK exists', async () => {
    const result = await getUserByNik('123456789');

    expect(result).not.toBeNull();
    expect(result!.nik).toEqual('123456789');
    expect(result!.name).toEqual('John Doe');
    expect(result!.position).toEqual('Manager');
    expect(result!.unit).toEqual('IT Department');
    expect(result!.location).toEqual('Jakarta');
    expect(result!.user_type).toEqual('admin');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when NIK does not exist', async () => {
    const result = await getUserByNik('nonexistent');

    expect(result).toBeNull();
  });

  it('should return correct user for each NIK', async () => {
    for (const testUser of testUsers) {
      const result = await getUserByNik(testUser.nik);
      
      expect(result).not.toBeNull();
      expect(result!.nik).toEqual(testUser.nik);
      expect(result!.name).toEqual(testUser.name);
      expect(result!.position).toEqual(testUser.position);
      expect(result!.unit).toEqual(testUser.unit);
      expect(result!.location).toEqual(testUser.location);
      expect(result!.user_type).toEqual(testUser.user_type);
    }
  });

  it('should handle empty string NIK', async () => {
    const result = await getUserByNik('');

    expect(result).toBeNull();
  });

  it('should handle special characters in NIK', async () => {
    // Insert user with special characters in NIK
    const specialUser = {
      nik: 'USER-001@TEST',
      name: 'Special User',
      position: 'Tester',
      unit: 'QA Department',
      location: 'Jakarta',
      user_type: 'user' as const,
      created_at: new Date(),
      updated_at: new Date()
    };

    await db.insert(usersTable).values(specialUser).execute();

    const result = await getUserByNik('USER-001@TEST');

    expect(result).not.toBeNull();
    expect(result!.nik).toEqual('USER-001@TEST');
    expect(result!.name).toEqual('Special User');
  });
});