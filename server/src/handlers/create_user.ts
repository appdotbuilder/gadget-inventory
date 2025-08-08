import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type User } from '../schema';

export const createUser = async (input: CreateUserInput): Promise<User> => {
  try {
    // Insert user record
    const result = await db.insert(usersTable)
      .values({
        nik: input.nik,
        name: input.name,
        position: input.position,
        unit: input.unit,
        location: input.location,
        user_type: input.user_type
      })
      .returning()
      .execute();

    // Return the created user
    return result[0];
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
};