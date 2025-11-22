import { Router } from 'express';
import pdfRoutes from './pdf';
import { ApiResponse } from '../types';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'API is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    },
  };
  res.json(response);
});

// API info endpoint
router.get('/', (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: 'PDF to Image Conversion API',
    data: {
      version: '1.0.0',
      description: 'Convert PDF files to images (JPG/PNG)',
      endpoints: {
        'POST /api/pdf/convert': 'Upload and convert PDF to images',
        'GET /api/pdf/status/:jobId': 'Get conversion job status',
        'GET /api/pdf/download/:jobId/:filename': 'Download converted image',
        'GET /api/pdf/jobs': 'Get all jobs (admin)',
        'GET /api/health': 'Health check',
      },
      supportedFormats: ['jpg', 'png'],
      maxFileSize: '10MB',
    },
  };
  res.json(response);
});

// Mount PDF routes
router.use('/pdf', pdfRoutes);

export default router;