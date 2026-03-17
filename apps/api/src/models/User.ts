import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { PlatformUser } from "@enterprise-commerce/core/platform/types"
import openDb from '../db/db';

/**
 * Creates a new user in the database.
 * * @param {Omit<PlatformUser, 'id'>} user - The user data to insert (excluding the autoincremental id).
 * @returns {Promise<PlatformUser>} - The created user object including the newly generated id.
 */
export const createUser = async (user: Omit<PlatformUser, 'id'>): Promise<PlatformUser> => {
  const db = await openDb();
  
  // 1. Hash the password before storing it for security
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  
  // 2. Prepare the user object for insertion
  const userRecord = { ...user, password: hashedPassword };
  
  // 3. Dynamically extract keys and values to build the SQL query
  const keys = Object.keys(userRecord);
  const placeholders = keys.map(() => '?').join(', ');
  const values = Object.values(userRecord);
  
  // 4. Execute the insertion
  const result = await db.run(
    `INSERT INTO users (${keys.join(', ')}) VALUES (${placeholders})`,
    values
  );
  
  await db.close();
  
  // 5. Return the full user object, mapping the autoincremental lastID to string 
  // (matching your findUserById signature)
  return {
    id: result.lastID?.toString(), 
    ...userRecord
  } as unknown as PlatformUser;
};

export const findUserById = async (id: string): Promise<PlatformUser | null> => {
  const db = await openDb();
  const user = await db.get<PlatformUser>('SELECT * FROM users WHERE id = ?', id);
  await db.close();
  return user || null;
};

/**
 * Compares a plain text password with a hashed password.
 *
 * This function uses bcrypt to asynchronously compare a plain text password with a hashed password 
 * to determine if they match.
 *
 * @param {string} password - The plain text password to be compared. (input from user when trying to login)
 * @param {string} hashedPassword - The hashed password to compare against. (encrypted password stored in database)
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the passwords match, 
 * and `false` otherwise.
 */
export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword); 
};