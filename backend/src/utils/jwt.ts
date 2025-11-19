import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Sign a JWT token with user payload
 * @param payload - User data to encode in token
 * @param secret - JWT secret key
 * @param expiresIn - Token expiration time (default: 7d)
 * @returns Signed JWT token
 */
export const signToken = (
  payload: JWTPayload,
  secret: string,
  expiresIn: string | number = '7d'
): string => {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Verify JWT token and extract payload
 * @param token - JWT token to verify
 * @param secret - JWT secret key
 * @returns Decoded payload or null if invalid
 */
export const verifyTokenUtil = (token: string, secret: string): JWTPayload | null => {
  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Express middleware to verify JWT token from Authorization header
 * Extracts Bearer token, verifies it, and attaches user to request
 */
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No token provided. Please include Authorization header with Bearer token',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
      return;
    }

    const decoded = verifyTokenUtil(token, secret);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};
