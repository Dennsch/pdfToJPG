export interface ConversionRequest {
  file: Express.Multer.File;
  format?: 'jpg' | 'png';
  quality?: number;
  density?: number;
}

export interface ConversionResult {
  success: boolean;
  message: string;
  jobId: string;
  totalPages?: number;
  images?: ImageInfo[];
  error?: string;
}

export interface ImageInfo {
  pageNumber: number;
  filename: string;
  path: string;
  size: number;
}

export interface ConversionOptions {
  format: 'jpg' | 'png';
  quality: number;
  density: number;
  outputDir: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ConversionJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalFilename: string;
  totalPages?: number;
  completedPages: number;
  images: ImageInfo[];
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}