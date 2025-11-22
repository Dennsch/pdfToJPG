import express from 'express';
import cors from 'cors';
import path from 'path';
import config from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import pdfConverterService from './services/pdfConverter';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Static file serving for uploads and output (optional, for direct access)
app.use('/uploads', express.static(config.uploadsPath));
app.use('/output', express.static(config.outputPath));

// Serve the HTML client
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Cleanup old jobs periodically (every hour)
setInterval(() => {
  console.log('Running cleanup of old jobs...');
  pdfConverterService.cleanupOldJobs(24); // Clean jobs older than 24 hours
}, 60 * 60 * 1000); // Run every hour

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
const server = app.listen(config.port, () => {
  console.log(`
🚀 PDF to Image API Server is running!
📍 Port: ${config.port}
🌍 Environment: ${config.nodeEnv}
📁 Upload Directory: ${config.uploadsPath}
📁 Output Directory: ${config.outputPath}
📊 Max File Size: ${(config.maxFileSize / 1024 / 1024).toFixed(1)}MB

API Endpoints:
• POST   /api/pdf/convert           - Upload and convert PDF
• GET    /api/pdf/status/:jobId     - Get job status
• GET    /api/pdf/download/:jobId/:filename - Download image
• GET    /api/pdf/jobs              - List all jobs
• GET    /api/health                - Health check
• GET    /api                       - API info

Example usage:
curl -X POST -F "pdf=@example.pdf" http://localhost:${config.port}/api/pdf/convert
  `);
});

export default app;