var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from 'mongoose';
import { UserSchema } from './Models/User.js';
import { AuthTokenModel } from './Models/Auth.js';
import { MediaModel } from './Models/Media.js';
const connectionString = process.env.CONNECTION_STRING || 'mongodb://user:password@localhost:27017/mediavault?authSource=admin';
export const dbConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield mongoose.connect(connectionString)
        .then(() => console.log("Database connected"))
        .catch((_error) => console.log('Unable to connect database.'));
});
// ### USER FUNCTIONS
/**
 * Creates a new user in the 'Users' collection
 * @param userData Object containing user properties (user, email, password)
 * @returns Promise with the created user document
 * @throws Error if user creation fails (e.g., duplicate key)
 */
export function createUser(userData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const newUser = new UserSchema({
                user: userData.user,
                email: userData.email,
                password: userData.password
            });
            const savedUser = yield newUser.save();
            return savedUser;
        }
        catch (error) {
            if (error.code === 11000) { // MongoDB duplicate key error
                throw new Error('Username or email already exists');
            }
            throw new Error(`Error creating user: ${error.message}`);
        }
    });
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
export function userExists(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let query = UserSchema.find({ email: user.email, user: user.user });
            const users = yield query.exec();
            return users.length == 0 ? false : true;
        }
        catch (error) {
            throw new Error(`Error retrieving users: ${error.message}`);
        }
    });
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
export function getUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const emailQuery = UserSchema.findOne({ email: user });
            const userQuery = UserSchema.findOne({ user: user });
            let response = yield emailQuery.exec();
            if (response)
                return response;
            response = yield userQuery.exec();
            return response;
        }
        catch (error) {
            throw new Error(`Error retrieving users: ${error.message}`);
        }
    });
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
export function saveToken(userId_1, token_1) {
    return __awaiter(this, arguments, void 0, function* (userId, token, expiresInHours = 24) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expiresInHours);
        const authToken = new AuthTokenModel({
            owner: userId,
            token,
            expiresAt
        });
        yield authToken.save();
    });
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
export function revokeToken(owner) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = AuthTokenModel.deleteOne({ owner: owner });
        const tokens = yield query.exec();
        console.log(`revoked token ${tokens}`);
    });
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
export function ownerHasToken(owner) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = AuthTokenModel.find({ owner: owner });
        const tokens = yield query.exec();
        return tokens.length > 0 ? true : false;
    });
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
export function getToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = AuthTokenModel.findOne({ token: token });
        const response = yield query.exec();
        return response;
    });
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
export function getMedia(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, skip = 0) {
        const result = yield MediaModel.find({ owner: userId })
            .select('owner name completedDate score poster mediaType language comment')
            .limit(10)
            .skip(skip)
            .lean()
            .exec();
        return result;
    });
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
export function saveMedia(media) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let model = new MediaModel(media);
            yield model.save();
        }
        catch (error) {
            console.error("Error while saving media:", error.message);
            throw new Error("Error while saving Media.");
        }
    });
}
