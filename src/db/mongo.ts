import mongoose from 'mongoose';
import { Media, User } from '../utils/types.js';
import { UserSchema } from './Models/User.js';
import { AuthTokenModel } from './Models/Auth.js';
import { MediaModel } from './Models/Media.js';

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

/**
 * Retrieves a user from the database by email or username
 * @async
 * @function getUser
 * @param {string} user - Email address or username to search for
 * @returns {Promise<any>} Returns:
 * - User document if found (either by email or username)
 * - null if no user matches the search criteria
 * @throws {Error} When there is a database query error
 * @example
 * // Find user by email or username
 * const user = await getUser('test@example.com');
 * if (user) {
 *   // User exists
 * } else {
 *   // User not found
 * }
 */
export async function getUser(user: string): Promise<any> {
  try {
    const emailQuery = UserSchema.findOne({ email: user });
    const userQuery = UserSchema.findOne({ user: user });

    let response = await emailQuery.exec();

    if (response) return response;

    response = await userQuery.exec();

    return response;
  } catch (error: any) {
    throw new Error(`Error retrieving users: ${error.message}`);
  }
}

//### TOKENS FUNCTIONS

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
 export async function getUser(user: string): Promise<any> {
  try {
    const emailQuery = UserSchema.findOne({ email: user });
    const userQuery = UserSchema.findOne({ user: user });
    
    let response = await emailQuery.exec();    

    if (response) return response;
    
    response = await userQuery.exec();

    return response;
  } catch (error: any) {
    throw new Error(`Error retrieving users: ${error.message}`);
  }
}* // Save a token with default expiration (24h)
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

/**
 * Revokes all authentication tokens associated with a specific user
 * @async
 * @function revokeToken
 * @param {string} owner - The user's ID whose tokens should be revoked
 * @returns {Promise<void>} Resolves when the operation is complete
 * @throws {Error} If the token revocation fails
 * @example
 * // Revoke all tokens for user with ID '507f1f77bcf86cd799439011'
 * await revokeToken('507f1f77bcf86cd799439011');
 * console.log('All tokens revoked successfully');
 */
export async function revokeToken(owner: string): Promise<void> {
  let query = AuthTokenModel.deleteOne({ owner: owner });
  const tokens = await query.exec();
  console.log(`revoked token ${tokens}`);
}

/**
 * Checks if a user currently has any active authentication tokens
 * @async
 * @function ownerHasToken
 * @param {string} owner - The user's ID to check for active tokens
 * @returns {Promise<boolean>} Returns:
 * - `true` if the user has at least one active token
 * - `false` if no tokens exist for this user
 * @throws {Error} If the database query fails
 * @example
 * // Check if user has active tokens
 * const hasToken = await ownerHasToken('507f1f77bcf86cd799439011');
 * if (hasToken) {
 *   console.log('User has active sessions');
 * } else {
 *   console.log('No active sessions found');
 * }
 */
export async function ownerHasToken(owner: string): Promise<boolean> {
  let query = AuthTokenModel.find({ owner: owner });
  const tokens = await query.exec();
  return tokens.length > 0 ? true : false;
}

/**
 * Retrieves an authentication token document from the database by token string
 * @async
 * @function getToken
 * @param {string} token - The JWT token string to search for
 * @returns {Promise<AuthTokenDocument|null>} Returns:
 * - The authentication token document if found
 * - `null` if no matching token is found
 * @throws {Error} If there is a database query error
 * @example
 * // Find token in database
 * try {
 *   const tokenDoc = await getToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 *   if (tokenDoc) {
 *     console.log('Token found, expires at:', tokenDoc.expiresAt);
 *   } else {
 *     console.log('Token not found in database');
 *   }
 * } catch (error) {
 *   console.error('Error searching for token:', error.message);
 * }
 */
export async function getToken(token: string): Promise<any> {
  let query = AuthTokenModel.findOne({ token: token });
  const response = await query.exec();
  return response;
}


// ### MEDIA FUNCTIONS

/**
 * Retrieves media items for a specific user with pagination
 * @async
 * @function getMedia
 * @param {string} userId - The owner's user ID
 * @param {number} [skip=0] - Number of items to skip (for pagination)
 * @returns {Promise<Media[]>} Array of Media objects without Mongoose metadata
 * @throws {Error} If there's a database error
 */
export async function getMedia(userId: string, skip: number = 0): Promise<Media[]> {
  const result = await MediaModel.find({owner: userId })
    .select('owner name completedDate score poster mediaType language comment')
    .limit(10)
    .skip(skip)
    .lean()
    .exec();
  
  return result as unknown as Media[];
}

/**
 * Saves a media item to the database
 * 
 * @async
 * @param {Media} media - The media object to be saved. Must conform to the Media interface.
 * @returns {Promise<void>} Resolves when the media is successfully saved.
 * @throws {Error} If there is an error during the save operation. The original error is logged to console.
 * 
 * @example
 * // Example usage
 * const newMedia = {
 *   owner: 'user123',
 *   name: 'Inception',
 *   completedDate: '2023-05-15',
 *   score: 9.5,
 *   poster: 'http://example.com/poster.jpg',
 *   mediaType: 'Movie',
 *   language: 'English'
 * };
 * 
 * try {
 *   await saveMedia(newMedia);
 *   console.log('Media saved successfully');
 * } catch (error) {
 *   console.error('Failed to save media:', error.message);
 * }
 * 
 * @see {@link Media} for the expected media object structure
 * @see {@link MediaModel} for the underlying Mongoose model
 */
export async function saveMedia(media: Media): Promise<void> {
  try {
    let model = new MediaModel(media);
    await model.save();
  }
  catch (error: any) {
    console.error("Error while saving media:", error.message);
    throw new Error("Error while saving Media.");
  }
}

/**
 * Retrieves a media item by its unique identifier
 * @async
 * @param {string} id - The MongoDB ObjectId of the media item to retrieve
 * @returns {Promise<Media | null>} A promise that resolves to:
 * - The Media object if found
 * - null if no media matches the provided ID
 * @throws {CastError} If the provided ID is not a valid MongoDB ObjectId
 * @throws {MongoError} If there's a database operation error
 * @example
 * // Example of successful retrieval
 * const media = await getMediaById('507f1f77bcf86cd799439011');
 * if (media) {
 *   console.log('Found media:', media.name);
 * } else {
 *   console.log('Media not found');
 * }
 * 
 * @see {@link MediaModel} for the underlying Mongoose model
 * @see {@link Media} for the media object structure
 */
export async function getMediaById(id: string): Promise<Media | null> {
  const result = await MediaModel.findOne({ _id: id }).exec();
  return result ? result : null;
}

/**
 * Deletes a media item by its unique identifier
 * @async
 * @param {string} id - The MongoDB ObjectId of the media item to delete
 * @returns {Promise<Media | null>} A promise that resolves to:
 * - The deleted Media object if found and removed
 * - null if no media matched the provided ID
 * @throws {CastError} If the provided ID is not a valid MongoDB ObjectId
 * @throws {MongoError} If there's a database operation error
 * @example
 * // Example of deletion
 * const deletedMedia = await deleteMediaById('507f1f77bcf86cd799439011');
 * if (deletedMedia) {
 *   console.log('Deleted media:', deletedMedia.name);
 * } else {
 *   console.log('Media not found or already deleted');
 * }
 * 
 * @see {@link MediaModel} for the underlying Mongoose model
 * @see {@link getMediaById} for the related retrieval function
 */
export async function deleteMediaById(id: string): Promise<Media | null> {
  const result = await MediaModel.findOneAndDelete({ _id: id }).exec();
  return result ? result : null;
}