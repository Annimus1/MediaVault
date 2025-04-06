import { Request, Response, NextFunction } from "express";
import { activeToken, validToken } from "./tokens.js";

/**
 * Express authentication middleware that validates JWT tokens
 * 
 * This middleware performs three-layer validation:
 * 1. Checks for valid server configuration (SECRET_KEY)
 * 2. Verifies presence of authorization token
 * 3. Validates token against database and cryptographic signature
 * 
 * @async
 * @function authMiddleware
 * @default
 * @requires {string} process.env.SECRET_KEY - JWT signing secret
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {Promise<void>}
 * 
 * @throws {401} If:
 * - No authorization token is provided
 * - Token is invalid or expired
 * @throws {500} If:
 * - Server configuration is missing (SECRET_KEY)
 * - Unexpected error occurs during validation
 * 
 * @example
 * // Apply to routes
 * import authMiddleware from './middlewares/auth';
 * 
 * // Single route
 * router.get('/protected', authMiddleware, (req, res) => {...});
 * 
 * // Router-level protection
 * const secureRouter = express.Router();
 * secureRouter.use(authMiddleware);
 * 
 * @see {@link activeToken} For database token validation
 * @see {@link validToken} For JWT signature verification
 */
export default async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // check if secret is defined
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      console.error("SECRET_KEY not defined.");
      res.status(500).send();
      return;
    }

    // get token
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: 'Auth Token required' });
      return;
    }

    // verify token exists and is active
    const ActiveToken = await activeToken(token); 
    if (!ActiveToken || !validToken(token, secretKey)){
      res.status(401).json({ message: 'Auth Token no valid' });
      return;
    }

    next();
  }
  catch (error) {
    console.error('Error en authMiddleware:', error);
    res.status(500).json({ message: 'Error de autenticación' });
  }
}