# Example Usage

This document provides examples of how to use the PDF to Image Conversion API.

## Quick Start

1. **Install and start the server:**
   ```bash
   npm install
   npm run dev
   ```

2. **Open the web interface:**
   Navigate to `http://localhost:3000` in your browser to use the HTML client.

3. **Or use the API directly:**

## API Examples

### 1. Convert PDF using cURL

```bash
# Basic conversion (JPG, default settings)
curl -X POST \
  -F "pdf=@example.pdf" \
  http://localhost:3000/api/pdf/convert

# Custom settings
curl -X POST \
  -F "pdf=@document.pdf" \
  -F "format=png" \
  -F "quality=95" \
  -F "density=200" \
  http://localhost:3000/api/pdf/convert
```

### 2. Check job status

```bash
curl http://localhost:3000/api/pdf/status/YOUR_JOB_ID
```

### 3. Download converted image

```bash
curl -O http://localhost:3000/api/pdf/download/YOUR_JOB_ID/page.1.jpg
```

## JavaScript/Node.js Example

```javascript
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function convertPdf() {
  const form = new FormData();
  form.append('pdf', fs.createReadStream('example.pdf'));
  form.append('format', 'jpg');
  form.append('quality', '90');
  form.append('density', '150');

  try {
    const response = await fetch('http://localhost:3000/api/pdf/convert', {
      method: 'POST',
      body: form
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Conversion successful!');
      console.log('Job ID:', result.data.jobId);
      console.log('Total pages:', result.data.totalPages);
      
      // Download images
      for (const image of result.data.images) {
        const imageResponse = await fetch(`http://localhost:3000${image.downloadUrl}`);
        const buffer = await imageResponse.buffer();
        fs.writeFileSync(image.filename, buffer);
        console.log(`Downloaded: ${image.filename}`);
      }
    } else {
      console.error('Conversion failed:', result.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

convertPdf();
```

## Python Example

```python
import requests
import os

def convert_pdf(pdf_path):
    url = 'http://localhost:3000/api/pdf/convert'
    
    with open(pdf_path, 'rb') as pdf_file:
        files = {'pdf': pdf_file}
        data = {
            'format': 'jpg',
            'quality': 90,
            'density': 150
        }
        
        response = requests.post(url, files=files, data=data)
        result = response.json()
        
        if result['success']:
            print(f"Conversion successful! Job ID: {result['data']['jobId']}")
            
            # Download images
            for image in result['data']['images']:
                download_url = f"http://localhost:3000{image['downloadUrl']}"
                img_response = requests.get(download_url)
                
                with open(image['filename'], 'wb') as img_file:
                    img_file.write(img_response.content)
                    print(f"Downloaded: {image['filename']}")
        else:
            print(f"Conversion failed: {result['message']}")

# Usage
convert_pdf('example.pdf')
```

## Response Examples

### Successful Conversion Response

```json
{
  "success": true,
  "message": "PDF converted successfully",
  "data": {
    "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "totalPages": 3,
    "images": [
      {
        "pageNumber": 1,
        "filename": "page.1.jpg",
        "downloadUrl": "/api/pdf/download/a1b2c3d4-e5f6-7890-abcd-ef1234567890/page.1.jpg",
        "size": 245760
      },
      {
        "pageNumber": 2,
        "filename": "page.2.jpg",
        "downloadUrl": "/api/pdf/download/a1b2c3d4-e5f6-7890-abcd-ef1234567890/page.2.jpg",
        "size": 198432
      },
      {
        "pageNumber": 3,
        "filename": "page.3.jpg",
        "downloadUrl": "/api/pdf/download/a1b2c3d4-e5f6-7890-abcd-ef1234567890/page.3.jpg",
        "size": 267891
      }
    ]
  }
}
```

### Job Status Response

```json
{
  "success": true,
  "message": "Job status retrieved successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "completed",
    "originalFilename": "document.pdf",
    "totalPages": 3,
    "completedPages": 3,
    "createdAt": "2023-12-07T10:30:00.000Z",
    "completedAt": "2023-12-07T10:30:15.000Z",
    "images": [...]
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Only PDF files are allowed. Please upload a valid PDF file.",
  "error": "Only PDF files are allowed"
}
```

## Testing the API

### Health Check

```bash
curl http://localhost:3000/api/health
```

### API Information

```bash
curl http://localhost:3000/api
```

### List All Jobs (Admin)

```bash
curl http://localhost:3000/api/pdf/jobs
```

## Tips

1. **File Size Limits**: Default maximum file size is 10MB. Adjust `MAX_FILE_SIZE` in `.env` if needed.

2. **Supported Formats**: Currently supports JPG and PNG output formats.

3. **Quality Settings**: 
   - Quality: 1-100 (higher = better quality, larger file size)
   - Density: 72-300 DPI (higher = better resolution, larger file size)

4. **File Cleanup**: Converted images are automatically cleaned up after 24 hours.

5. **Concurrent Requests**: The API can handle multiple conversion requests simultaneously.

6. **Error Handling**: Always check the `success` field in the response before processing results.