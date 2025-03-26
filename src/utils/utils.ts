import { User } from "./types.js";

/**
 * Parses and validates user input to ensure it matches the User type requirements.
 * @param {any} incomingUser - The raw user input object from the request
 * @returns {User} A validated User object with required properties
 * @throws {TypeError} If any required property is missing or invalid
 * @example
 * // Returns valid User object
 * parseUser({ user: 'john_doe', password: 'secure123', email: 'john@example.com' });
 * 
 * @example
 * // Throws TypeError
 * parseUser({ user: 123, password: 'secure123', email: 'john@example.com' });
 */
export function parseUser(incomingUser: any): User {
    if (
        incomingUser.hasOwnProperty("user") &&
        incomingUser.hasOwnProperty("password") &&
        incomingUser.hasOwnProperty("email")
    ) {
        if (!isString(incomingUser.user)) {
            throw new TypeError("'user' must be a String.");
        }
        if (!isString(incomingUser.password)) {
            throw new TypeError("'password' must be a String.");
        }
        if (!isString(incomingUser.email) || !isValidEmail(incomingUser.email)) {
            throw new TypeError("Not valid email.");
        }

        return { 
            user: incomingUser.user, 
            password: incomingUser.password, 
            email: incomingUser.email 
        };
    } else {
        throw new TypeError("'user', 'email' or 'password' property missing.");
    }
}

/**
 * Type guard to check if a value is a string.
 * @param {any} param - The value to check
 * @returns {boolean} True if the parameter is a string (primitive or String object), false otherwise
 * @example
 * isString('test'); // true
 * isString(new String('test')); // true
 * isString(123); // false
 */
function isString(param: any): boolean {
    return (typeof param === 'string' || param instanceof String);
}

/**
 * Validates if a string is a properly formatted email address.
 * @param {any} param - The value to validate as email
 * @returns {boolean} True if the parameter matches standard email format, false otherwise
 * @example
 * isValidEmail('user@example.com'); // true
 * isValidEmail('invalid-email'); // false
 * @see RFC 5322 for email specification
 */
function isValidEmail(param: any): boolean {
    const validEmail = String(param)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    return validEmail !== null;
}