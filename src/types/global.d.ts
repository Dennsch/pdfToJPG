// Global type declarations

// Ensure Express and Multer types are available globally
import 'express';
import 'multer';

// Extend global namespace if needed
declare global {
  namespace Express {
    interface Request {
      // Add any custom request properties here if needed
    }
  }
}

export {};