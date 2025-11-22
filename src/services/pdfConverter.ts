import { fromPath } from 'pdf2pic';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConversionOptions, ConversionResult, ImageInfo, ConversionJob } from '../types';
import config from '../config';

// Ensure output directory exists
if (!fs.existsSync(config.outputPath)) {
  fs.mkdirSync(config.outputPath, { recursive: true });
}

// In-memory job storage (in production, use a database)
const jobs = new Map<string, ConversionJob>();

export class PdfConverterService {
  
  /**
   * Convert PDF to images
   */
  async convertPdfToImages(
    filePath: string,
    originalFilename: string,
    options: Partial<ConversionOptions> = {}
  ): Promise<ConversionResult> {
    const jobId = uuidv4();
    
    // Create job entry
    const job: ConversionJob = {
      id: jobId,
      status: 'pending',
      originalFilename,
      completedPages: 0,
      images: [],
      createdAt: new Date(),
    };
    
    jobs.set(jobId, job);

    try {
      // Update job status
      job.status = 'processing';
      jobs.set(jobId, job);

      const conversionOptions: ConversionOptions = {
        format: options.format || config.defaultFormat,
        quality: options.quality || config.defaultQuality,
        density: options.density || config.defaultDensity,
        outputDir: options.outputDir || config.outputPath,
      };

      // Create unique output directory for this conversion
      const outputDir = path.join(conversionOptions.outputDir, jobId);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Configure pdf2pic
      const convert = fromPath(filePath, {
        density: conversionOptions.density,
        saveFilename: 'page',
        savePath: outputDir,
        format: conversionOptions.format,
        width: undefined, // Let pdf2pic determine based on density
        height: undefined,
      });

      // Get total pages first
      const result = await convert.bulk(-1, { responseType: 'image' });
      
      if (!result || result.length === 0) {
        throw new Error('Failed to convert PDF - no pages found');
      }

      job.totalPages = result.length;
      
      const images: ImageInfo[] = [];

      // Process each page
      for (let i = 0; i < result.length; i++) {
        const pageResult = result[i];
        
        if (pageResult && pageResult.path) {
          const stats = fs.statSync(pageResult.path);
          const filename = path.basename(pageResult.path);
          
          const imageInfo: ImageInfo = {
            pageNumber: i + 1,
            filename,
            path: pageResult.path,
            size: stats.size,
          };
          
          images.push(imageInfo);
          job.completedPages = i + 1;
          job.images = images;
          jobs.set(jobId, job);
        }
      }

      // Update job as completed
      job.status = 'completed';
      job.completedAt = new Date();
      jobs.set(jobId, job);

      // Clean up original file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        success: true,
        message: 'PDF converted successfully',
        jobId,
        totalPages: images.length,
        images,
      };

    } catch (error) {
      // Update job as failed
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      jobs.set(jobId, job);

      // Clean up files on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const outputDir = path.join(config.outputPath, jobId);
      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }

      return {
        success: false,
        message: 'Failed to convert PDF',
        jobId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): ConversionJob | null {
    return jobs.get(jobId) || null;
  }

  /**
   * Get all jobs (for debugging/admin purposes)
   */
  getAllJobs(): ConversionJob[] {
    return Array.from(jobs.values());
  }

  /**
   * Clean up old jobs and files
   */
  cleanupOldJobs(maxAgeHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    
    for (const [jobId, job] of jobs.entries()) {
      if (job.createdAt < cutoffTime) {
        // Remove files
        const outputDir = path.join(config.outputPath, jobId);
        if (fs.existsSync(outputDir)) {
          fs.rmSync(outputDir, { recursive: true, force: true });
        }
        
        // Remove job from memory
        jobs.delete(jobId);
      }
    }
  }

  /**
   * Get image file
   */
  getImageFile(jobId: string, filename: string): string | null {
    const job = jobs.get(jobId);
    if (!job || job.status !== 'completed') {
      return null;
    }

    const imagePath = path.join(config.outputPath, jobId, filename);
    if (fs.existsSync(imagePath)) {
      return imagePath;
    }

    return null;
  }
}

export default new PdfConverterService();