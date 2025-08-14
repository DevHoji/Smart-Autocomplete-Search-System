
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/types';

export const errorHandler = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error occurred:', {
    message: error.message,
    stack: (error as Error).stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  if ('status' in error && 'code' in error) {
    const apiError = error as ApiError;
    res.status(apiError.status).json({
      error: {
        message: apiError.message,
        code: apiError.code,
        details: apiError.details,
      },
    });
    return;
  }

  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.message,
      },
    });
    return;
  }

  if (error.name === 'SyntaxError' && 'body' in error) {
    res.status(400).json({
      error: {
        message: 'Invalid JSON in request body',
        code: 'INVALID_JSON',
      },
    });
    return;
  }

  if (error.message.includes('duplicate key')) {
    res.status(409).json({
      error: {
        message: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      message: process.env['NODE_ENV'] === 'production'
        ? 'Internal server error'
        : error.message,
      code: 'INTERNAL_ERROR',
    },
  });
};


export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
};


export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


export const createApiError = (
  message: string,
  code: string,
  status: number = 400,
  details?: any
): ApiError => {
  return {
    message,
    code,
    status,
    details,
  };
};


export const validateRequest = (schema: any, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property]);
    
    if (error) {
      const apiError = createApiError(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }))
      );
      return next(apiError);
    }
    
    next();
  };
};


export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};


export const corsHandler = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', process.env['FRONTEND_URL'] || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Max-Age', '86400'); 
    res.sendStatus(200);
    return;
  }
  next();
};
