import { Router, Request, Response, NextFunction } from 'express';
import upload from '../middleware/upload';
import pdfConverterService from '../services/pdfConverter';
import { ApiResponse, ConversionOptions } from '../types';
import path from 'path';

const router = Router();

/**
 * POST /api/pdf/convert
 * Upload and convert PDF to images
 */
router.post('/convert', upload.single('pdf'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        message: 'No PDF file uploaded. Please provide a PDF file.',
      };
      return res.status(400).json(response);
    }

    // Parse conversion options from request body
    const options: Partial<ConversionOptions> = {};
    
    if (req.body.format && ['jpg', 'png'].includes(req.body.format)) {
      options.format = req.body.format;
    }
    
    if (req.body.quality) {
      const quality = parseInt(req.body.quality, 10);
      if (quality >= 1 && quality <= 100) {
        options.quality = quality;
      }
    }
    
    if (req.body.density) {
      const density = parseInt(req.body.density, 10);
      if (density >= 72 && density <= 300) {
        options.density = density;
      }
    }

    // Convert PDF to images
    const result = await pdfConverterService.convertPdfToImages(
      req.file.path,
      req.file.originalname,
      options
    );

    if (result.success) {
      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: {
          jobId: result.jobId,
          totalPages: result.totalPages,
          images: result.images?.map(img => ({
            pageNumber: img.pageNumber,
            filename: img.filename,
            downloadUrl: `/api/pdf/download/${result.jobId}/${img.filename}`,
            size: img.size,
          })),
        },
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        message: result.message,
        error: result.error,
      };
      res.status(500).json(response);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/pdf/status/:jobId
 * Get conversion job status
 */
router.get('/status/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  
  const job = pdfConverterService.getJobStatus(jobId);
  
  if (!job) {
    const response: ApiResponse = {
      success: false,
      message: 'Job not found',
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Job status retrieved successfully',
    data: {
      id: job.id,
      status: job.status,
      originalFilename: job.originalFilename,
      totalPages: job.totalPages,
      completedPages: job.completedPages,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error,
      images: job.images.map(img => ({
        pageNumber: img.pageNumber,
        filename: img.filename,
        downloadUrl: `/api/pdf/download/${jobId}/${img.filename}`,
        size: img.size,
      })),
    },
  };

  res.json(response);
});

/**
 * GET /api/pdf/download/:jobId/:filename
 * Download converted image
 */
router.get('/download/:jobId/:filename', (req: Request, res: Response) => {
  const { jobId, filename } = req.params;
  
  const imagePath = pdfConverterService.getImageFile(jobId, filename);
  
  if (!imagePath) {
    const response: ApiResponse = {
      success: false,
      message: 'Image not found',
    };
    return res.status(404).json(response);
  }

  // Set appropriate headers
  const ext = path.extname(filename).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
  
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Send file
  res.sendFile(imagePath);
});

/**
 * GET /api/pdf/jobs
 * Get all jobs (for debugging/admin purposes)
 */
router.get('/jobs', (req: Request, res: Response) => {
  const jobs = pdfConverterService.getAllJobs();
  
  const response: ApiResponse = {
    success: true,
    message: 'Jobs retrieved successfully',
    data: jobs.map(job => ({
      id: job.id,
      status: job.status,
      originalFilename: job.originalFilename,
      totalPages: job.totalPages,
      completedPages: job.completedPages,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      error: job.error,
      imageCount: job.images.length,
    })),
  };

  res.json(response);
});

export default router;