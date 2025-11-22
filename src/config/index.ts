import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  outputDir: process.env.OUTPUT_DIR || 'output',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  
  // PDF conversion settings
  defaultDensity: 150,
  defaultQuality: 90,
  defaultFormat: 'jpg' as const,
  
  // File paths
  uploadsPath: path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  outputPath: path.join(process.cwd(), process.env.OUTPUT_DIR || 'output'),
};

export default config;