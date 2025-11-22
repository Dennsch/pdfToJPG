import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle multer errors
  if (err.message === 'Only PDF files are allowed') {
    statusCode = 400;
    message = 'Only PDF files are allowed. Please upload a valid PDF file.';
  } else if (err.message === 'File too large') {
    statusCode = 413;
    message = 'File size exceeds the maximum allowed limit.';
  } else if (err.message?.includes('LIMIT_FILE_SIZE')) {
    statusCode = 413;
    message = 'File size exceeds the maximum allowed limit.';
  }

  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode,
    url: req.url,
    method: req.method,
  });

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
  };
  
  res.status(404).json(response);
};

export default errorHandler;