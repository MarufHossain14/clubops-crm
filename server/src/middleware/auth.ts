import { getAuth } from '@clerk/express';
import { Request, Response, NextFunction } from 'express';

// Helper to get authenticated user ID from request
export const getAuthUserId = (req: Request): string | null => {
  try {
    const { userId } = getAuth(req);
    return userId || null;
  } catch (error) {
    return null;
  }
};

// Middleware to check if user is authenticated (returns 401 if not)
// Note: clerkMiddleware() must be called before this in the Express app
export const requireAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized - Authentication required',
        error: 'Please sign in to access this resource'
      });
    }
    // Attach userId to request for use in controllers
    (req as any).userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized - Invalid or expired token',
      error: 'Please sign in again'
    });
  }
};

// Optional authentication middleware - doesn't require auth but adds userId if available
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    (req as any).userId = userId || null;
    next();
  } catch (error) {
    // If not authenticated, continue without userId
    (req as any).userId = null;
    next();
  }
};

