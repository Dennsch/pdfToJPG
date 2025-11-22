declare module 'pdf2pic' {
  export interface ConvertOptions {
    density?: number;
    saveFilename?: string;
    savePath?: string;
    format?: 'jpg' | 'png';
    width?: number;
    height?: number;
    quality?: number;
  }

  export interface ConvertResult {
    name: string;
    size: number;
    fileType: string;
    width: number;
    height: number;
    density: number;
    outputType: string;
    page: number;
    path: string;
  }

  export interface BulkOptions {
    responseType?: 'image' | 'base64';
  }

  export interface Converter {
    bulk(pages: number, options?: BulkOptions): Promise<ConvertResult[]>;
    convert(page: number, options?: BulkOptions): Promise<ConvertResult>;
  }

  export function fromPath(pdfPath: string, options?: ConvertOptions): Converter;
  export function fromBuffer(buffer: Buffer, options?: ConvertOptions): Converter;
  export function fromBase64(base64: string, options?: ConvertOptions): Converter;
}