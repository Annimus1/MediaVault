import mongoose from 'mongoose';
import { User } from '../utils/types.js';
import { UserSchema } from './Models/User.js';
import { AuthTokenModel } from './Models/Auth.js';

const connectionString = process.env.CONNECTION_STRING || 'mongodb://user:password@localhost:27017/mediavault?authSource=admin';

export const dbConnection = async () => await mongoose.connect(connectionString!)
  .then(() => console.log("Database connected"))
  .catch((_error: Error) => console.log('Unable to connect database.'));

// ### USER FUNCTIONS

/**
 * Creates a new user in the 'Users' collection
 * @param userData Object containing user properties (user, email, password)
 * @returns Promise with the created user document
 * @throws Error if user creation fails (e.g., duplicate key)
 */
export async function createUser(userData: User) {
  try {
    const newUser = new UserSchema({
      user: userData.user,
      email: userData.email,
      password: userData.password
    });

    const savedUser = await newUser.save();
    return savedUser;
  } catch (error: any) {
    if (error.code === 11000) { // MongoDB duplicate key error
      throw new Error('Username or email already exists');
    }
    throw new Error(`Error creating user: ${error.message}`);
  }
}

/**
 * Checks if a user already exists in the database based on email or username
 * @async
 * @function userExists
 * @param {User} user - User object containing at least email and username
 * @returns {Promise<boolean>} Returns:
 * - `true` if a user with the same email or username exists
 * - `false` if no matching user is found
 * @throws {Error} If there's a database query error
 * @example
 * // Check if user exists
 * const exists = await userExists({ 
 *   user: 'john_doe', 
 *   email: 'john@example.com',
 *   password: '...' 
 * });
 * if (exists) {
 *   console.log('User already registered');
 * }
 */
export async function userExists(user: User): Promise<boolean> {
  try {
    let query = UserSchema.find({ email: user.email, user: user.user });
    const users = await query.exec();
    return users.length == 0 ? false : true;
  } catch (error: any) {
    throw new Error(`Error retrieving users: ${error.message}`);
  }
}


//### TOKENS

/**
 * Saves a JWT token to the database with expiration time
 * @async
 * @function saveToken
 * @param {string} userId - MongoDB ObjectId of the user as string
 * @param {string} token - JWT token to be stored
 * @param {number} [expiresInHours=24] - Token validity duration in hours (default: 24)
 * @returns {Promise<void>} Resolves when token is successfully saved
 * @throws {Error} If token saving fails
 * @example
 * // Save a token with default expiration (24h)
 * await saveToken('507f1f77bcf86cd799439011', 'eyJhbGci...');
 * 
 * // Save a token with custom expiration (48h)
 * await saveToken('507f1f77bcf86cd799439011', 'eyJhbGci...', 48);
 */
export async function saveToken(
  userId: string, 
  token: string, 
  expiresInHours: number = 24
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const authToken = new AuthTokenModel({
    owner: userId,
    token,
    expiresAt
  });

  await authToken.save();
}