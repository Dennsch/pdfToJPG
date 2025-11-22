# PDF to Image Conversion API

A TypeScript-based REST API that converts PDF files into individual images (JPG/PNG) for each page. Built with Express.js and pdf2pic.

## Features

- 🔄 Convert PDF files to JPG or PNG images
- 📄 Extract each page as a separate image
- 🎛️ Configurable image quality and density
- 📊 Job status tracking with unique IDs
- 🔒 File validation and size limits
- 🧹 Automatic cleanup of old files
- 📝 Comprehensive error handling
- 🚀 TypeScript for type safety

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pdf-to-jpg-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file as needed:
   ```env
   PORT=3000
   NODE_ENV=development
   UPLOAD_DIR=uploads
   OUTPUT_DIR=output
   MAX_FILE_SIZE=10485760
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### 1. Convert PDF to Images

**POST** `/api/pdf/convert`

Upload a PDF file and convert it to images.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `pdf` (file, required): PDF file to convert
  - `format` (string, optional): Output format (`jpg` or `png`, default: `jpg`)
  - `quality` (number, optional): Image quality 1-100 (default: 90)
  - `density` (number, optional): Image density 72-300 DPI (default: 150)

**Response:**
```json
{
  "success": true,
  "message": "PDF converted successfully",
  "data": {
    "jobId": "uuid-string",
    "totalPages": 5,
    "images": [
      {
        "pageNumber": 1,
        "filename": "page.1.jpg",
        "downloadUrl": "/api/pdf/download/uuid-string/page.1.jpg",
        "size": 245760
      }
    ]
  }
}
```

**Example:**
```bash
curl -X POST \
  -F "pdf=@document.pdf" \
  -F "format=jpg" \
  -F "quality=95" \
  -F "density=200" \
  http://localhost:3000/api/pdf/convert
```

### 2. Get Job Status

**GET** `/api/pdf/status/:jobId`

Get the status of a conversion job.

**Response:**
```json
{
  "success": true,
  "message": "Job status retrieved successfully",
  "data": {
    "id": "uuid-string",
    "status": "completed",
    "originalFilename": "document.pdf",
    "totalPages": 5,
    "completedPages": 5,
    "createdAt": "2023-12-07T10:30:00.000Z",
    "completedAt": "2023-12-07T10:30:15.000Z",
    "images": [...]
  }
}
```

**Job Status Values:**
- `pending`: Job created but not started
- `processing`: Conversion in progress
- `completed`: Conversion finished successfully
- `failed`: Conversion failed

### 3. Download Image

**GET** `/api/pdf/download/:jobId/:filename`

Download a converted image file.

**Response:** Binary image file with appropriate headers.

**Example:**
```bash
curl -O http://localhost:3000/api/pdf/download/uuid-string/page.1.jpg
```

### 4. List All Jobs (Admin)

**GET** `/api/pdf/jobs`

Get a list of all conversion jobs.

### 5. Health Check

**GET** `/api/health`

Check if the API is running.

### 6. API Information

**GET** `/api`

Get API information and available endpoints.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `UPLOAD_DIR` | Upload directory | `uploads` |
| `OUTPUT_DIR` | Output directory | `output` |
| `MAX_FILE_SIZE` | Max file size in bytes | `10485760` (10MB) |

### Conversion Options

| Option | Description | Range | Default |
|--------|-------------|-------|---------|
| `format` | Output format | `jpg`, `png` | `jpg` |
| `quality` | Image quality | 1-100 | 90 |
| `density` | Image density (DPI) | 72-300 | 150 |

## Development

### Scripts

```bash
# Install dependencies
npm install

# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Clean build directory
npm run clean
```

### Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── server.ts        # Main server file
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid file type or missing file
- **413 Payload Too Large**: File exceeds size limit
- **404 Not Found**: Job or image not found
- **500 Internal Server Error**: Conversion or server errors

## File Management

- Uploaded PDF files are automatically deleted after conversion
- Converted images are stored with unique job IDs
- Old jobs and files are automatically cleaned up every 24 hours
- Files are organized in job-specific directories

## Dependencies

### Runtime Dependencies
- `express`: Web framework
- `multer`: File upload handling
- `pdf2pic`: PDF to image conversion
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management
- `uuid`: Unique ID generation

### Development Dependencies
- `typescript`: TypeScript compiler
- `ts-node-dev`: Development server with auto-reload
- `@types/*`: TypeScript type definitions

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please create an issue in the repository.