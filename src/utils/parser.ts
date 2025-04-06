import { Language, MediaType } from "./enums.js";
import { Media, User, UserLogin } from "./types.js";

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

export function parseLogin(incomingUser: any): UserLogin {
  if (
    incomingUser.hasOwnProperty('user') &&
    incomingUser.hasOwnProperty('password')
  ) {
    if (!isString(incomingUser.user)) {
      throw new TypeError("'user' must be a String.");
    }
    if (!isString(incomingUser.password)) {
      throw new TypeError("'password' must be a String.");
    }

    return {
      user: incomingUser.user,
      password: incomingUser.password
    }

  } else {
    throw new TypeError("'user' or 'password' property missing.");
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

/**
 * Validates if a parameter can be parsed as a valid Date
 * @param {any} param - The value to validate
 * @returns {boolean} Returns `true` if the parameter is a valid date string or Date object, `false` otherwise
 * @example
 * isDate("2023-05-15"); // true
 * isDate("invalid-date"); // false
 */
function isDate(param: any): boolean {
  return Date.parse(param) ? true : false;
}

/**
 * Validates if a number is within the acceptable range (0.0 to 10.0)
 * @param {any} param - The value to validate (number or string representation)
 * @returns {boolean} Returns:
 * - `true` if the parameter is a valid number within range
 * - `false` if the parameter is outside range or not convertible to a number
 * @example
 * isNumberValid(5.5); // true
 * isNumberValid("7.2"); // true
 * isNumberValid(11); // false
 */
function isNumberValid(param: any): boolean {
  const maxRange = 10.0;
  const minRange = 0.0;

  if (typeof param === 'number') {
    return !(param < minRange || param > maxRange);
  } else {
    const result = parseFloat(param);
    return !!result && !(result < minRange || result > maxRange);
  }
}

/**
 * Validates if a parameter is a valid MediaType enum value
 * @param {any} param - The value to validate
 * @returns {boolean} Returns `true` if the parameter matches a MediaType enum value (case-insensitive)
 * @throws {TypeError} If the parameter is not a string
 * @example
 * // Assuming MediaType includes 'MOVIE', 'SERIES'
 * isMediaType("movie"); // true
 * isMediaType("THEATER"); // false
 * @see {@link MediaType} For available values
 */
function isMediaType(param: any): boolean {
  if (isString(param)) {
    return Object.values(MediaType).includes(param.toLowerCase());
  }
  throw new TypeError("Parameter must be a string");
}

/**
 * Validates if a parameter is a valid Language enum value
 * @param {any} param - The value to validate
 * @returns {boolean} Returns `true` if the parameter matches a Language enum value (case-insensitive)
 * @throws {TypeError} If the parameter is not a string
 * @example
 * // Assuming Language includes 'English', 'Espanish'
 * isLanguage("Spanish"); // true
 * isLanguage("French"); // false
 * @see {@link Language} For available values
*/
function isLanguage(param: any): boolean {
  if (isString(param)) {
    return Object.values(Language).includes(param.toLowerCase());
  }
  throw new TypeError("Parameter must be a string");
}

/**
 * Parses and validates raw media data into a properly formatted Media object
 * 
 * @function parseMedia
 * @param {any} media - The raw media data object to parse
 * @param {string} owner - The owner/creator ID to associate with the media
 * @returns {Media} A validated and properly formatted Media object
 * @throws {TypeError} If:
 * - Any required property is missing
 * - Any property fails type validation
 * - MediaType or Language values are invalid
 * 
 * @example
 * // Successful parsing
 * const validMedia = {
 *   name: "Inception",
 *   completedDate: "2023-05-15",
 *   score: 9.5,
 *   poster: "http://example.com/poster.jpg",
 *   mediaType: "movie",
 *   language: "english",
 *   comment: "Great film!"
 * };
 * const parsed = parseMedia(validMedia, "user123");
 * 
 * @example
 * // Throws TypeError
 * parseMedia({ name: 123 }, "user123"); // Invalid name type
 * 
 * @see {@link isDate} For date validation
 * @see {@link isNumberValid} For score validation
 * @see {@link isMediaType} For media type validation
 * @see {@link isLanguage} For language validation
 */
export function parseMedia(media: any, owner: string): Media {
  if (
    media.hasOwnProperty('name') &&
    media.hasOwnProperty('completedDate') &&
    media.hasOwnProperty('score') &&
    media.hasOwnProperty('poster') &&
    media.hasOwnProperty('mediaType') &&
    media.hasOwnProperty('language') &&
    media.hasOwnProperty('comment')
  ) {

    // Validate all properties
    if (!isString(media.name)) throw new TypeError("Property 'name' must be a string.");
    if (media.comment && !isString(media.comment)) throw new TypeError("Property 'comment' must be a string.");
    if (!isDate(media.completedDate)) throw new TypeError("Property 'completedDate' must be in date format (YYYY-MM-DD)");
    if (!isNumberValid(media.score)) throw new TypeError("Property 'score' must be a number between 0 and 10.");
    if (!isString(media.poster)) throw new TypeError("Property 'poster' must be a string.");
    if (!isMediaType(media.mediaType)) throw new TypeError("Invalid media type.");
    if (!isLanguage(media.language)) throw new TypeError("Invalid language.");

    // Format enum values
    const _type = media.mediaType.toLowerCase();
    const _lang = media.language.toLowerCase();

    return {
      owner: owner,
      name: media.name,
      completedDate: media.completedDate,
      score: media.score,
      comment: media.comment,
      poster: media.poster,
      mediaType: _type,
      language: _lang
    };

  } else {
    throw new TypeError("Missing required properties. Needed: name, completedDate, score, poster, mediaType, language, comment");
  }
}