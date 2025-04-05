import jwt from "jsonwebtoken";
import { getToken } from "../db/mongo";

/**
 * Verifies if a JWT token is cryptographically valid
 * @function validToken
 * @param {string} token - The JWT token to validate
 * @param {string} secretKey - The secret key used to verify the token signature
 * @returns {boolean} Returns:
 * - `true` if the token is valid and verified
 * - `false` if the token is invalid, expired, or verification fails
 * @example
 * // Verify a token
 * const isValid = validToken('eyJhbGci...', 'your-secret-key');
 * if (isValid) {
 *   console.log('Token is valid');
 * } else {
 *   console.log('Token is invalid');
 * }
 */
export function validToken(token: string, secretKey: string): boolean {
  try {
    const payload = jwt.verify(token, secretKey);
    return payload ? true : false;
  } catch (error: any) {
    console.log('Error: ', error.message);
    return false;
  }
}

/**
 * Checks if a token exists and is active in the database
 * @async
 * @function activeToken
 * @param {string} token - The JWT token to check
 * @returns {Promise<boolean>} Returns:
 * - `true` if the token exists in the database
 * - `false` if the token doesn't exist or there's a database error
 * @throws {Error} If there's an unexpected database error (logged to console)
 * @example
 * // Check if token is active
 * const isActive = await activeToken('eyJhbGci...');
 * if (isActive) {
 *   console.log('Token is active');
 * } else {
 *   console.log('Token is not active');
 * }
 */
export async function activeToken(token: string): Promise<boolean> {
  try {
    const tokenDB = await getToken(token);
    return tokenDB ? true : false;
  } catch (error: any) {
    console.log('Error: ', error.message);
    return false;
  }
}