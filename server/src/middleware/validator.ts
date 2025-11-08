import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';

// Simple validation helper - consider using Zod or Joi for production
export const validateRequired = (fields: string[], data: any): void => {
  const missing: string[] = [];

  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missing.join(', ')}`);
  }
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize string input
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Validate and sanitize request body
export const validateRequestBody = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      validateRequired(requiredFields, req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Validate ID parameter
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const numId = Number(id);

  if (isNaN(numId) || numId <= 0) {
    return next(new ApiError(400, 'Invalid ID parameter'));
  }

  next();
};

