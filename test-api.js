#!/usr/bin/env node

/**
 * Simple test script for the PDF to Image API
 * Usage: node test-api.js [pdf-file-path]
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Use node-fetch for Node.js < 18, or built-in fetch for Node.js >= 18
let fetch;
try {
  fetch = globalThis.fetch;
} catch {
  fetch = require('node-fetch');
}

const API_BASE = 'http://localhost:3000/api';

async function testApi(pdfPath) {
  console.log('🧪 Testing PDF to Image API...\n');

  // 1. Health check
  console.log('1. Health check...');
  try {
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.success ? 'PASSED' : 'FAILED');
  } catch (error) {
    console.log('❌ Health check: FAILED -', error.message);
    return;
  }

  // 2. API info
  console.log('\n2. API info...');
  try {
    const infoResponse = await fetch(`${API_BASE}`);
    const infoData = await infoResponse.json();
    console.log('✅ API info:', infoData.success ? 'PASSED' : 'FAILED');
    console.log('   Version:', infoData.data?.version);
  } catch (error) {
    console.log('❌ API info: FAILED -', error.message);
  }

  // 3. PDF conversion (if PDF file provided)
  if (pdfPath && fs.existsSync(pdfPath)) {
    console.log('\n3. PDF conversion...');
    console.log('   File:', pdfPath);
    
    try {
      const form = new FormData();
      form.append('pdf', fs.createReadStream(pdfPath));
      form.append('format', 'jpg');
      form.append('quality', '90');
      form.append('density', '150');

      console.log('   Uploading and converting...');
      const convertResponse = await fetch(`${API_BASE}/pdf/convert`, {
        method: 'POST',
        body: form
      });

      const convertData = await convertResponse.json();
      
      if (convertData.success) {
        console.log('✅ PDF conversion: PASSED');
        console.log('   Job ID:', convertData.data.jobId);
        console.log('   Total pages:', convertData.data.totalPages);
        console.log('   Images:', convertData.data.images.length);

        // 4. Job status check
        console.log('\n4. Job status check...');
        const statusResponse = await fetch(`${API_BASE}/pdf/status/${convertData.data.jobId}`);
        const statusData = await statusResponse.json();
        
        if (statusData.success) {
          console.log('✅ Job status: PASSED');
          console.log('   Status:', statusData.data.status);
          console.log('   Completed pages:', statusData.data.completedPages);
        } else {
          console.log('❌ Job status: FAILED -', statusData.message);
        }

        // 5. Download test (first image)
        if (convertData.data.images.length > 0) {
          console.log('\n5. Download test...');
          const firstImage = convertData.data.images[0];
          const downloadUrl = `${API_BASE}/pdf/download/${convertData.data.jobId}/${firstImage.filename}`;
          
          try {
            const downloadResponse = await fetch(downloadUrl);
            if (downloadResponse.ok) {
              const buffer = await downloadResponse.buffer();
              const testFilename = `test-${firstImage.filename}`;
              fs.writeFileSync(testFilename, buffer);
              console.log('✅ Download test: PASSED');
              console.log('   Downloaded:', testFilename, `(${buffer.length} bytes)`);
              
              // Clean up test file
              setTimeout(() => {
                if (fs.existsSync(testFilename)) {
                  fs.unlinkSync(testFilename);
                  console.log('   Cleaned up test file');
                }
              }, 5000);
            } else {
              console.log('❌ Download test: FAILED - HTTP', downloadResponse.status);
            }
          } catch (error) {
            console.log('❌ Download test: FAILED -', error.message);
          }
        }

        // 6. List jobs
        console.log('\n6. List jobs...');
        try {
          const jobsResponse = await fetch(`${API_BASE}/pdf/jobs`);
          const jobsData = await jobsResponse.json();
          
          if (jobsData.success) {
            console.log('✅ List jobs: PASSED');
            console.log('   Total jobs:', jobsData.data.length);
          } else {
            console.log('❌ List jobs: FAILED -', jobsData.message);
          }
        } catch (error) {
          console.log('❌ List jobs: FAILED -', error.message);
        }

      } else {
        console.log('❌ PDF conversion: FAILED -', convertData.message);
      }
    } catch (error) {
      console.log('❌ PDF conversion: FAILED -', error.message);
    }
  } else {
    console.log('\n3. PDF conversion: SKIPPED (no valid PDF file provided)');
    console.log('   Usage: node test-api.js path/to/your/file.pdf');
  }

  console.log('\n🏁 Test completed!');
}

// Get PDF file path from command line arguments
const pdfPath = process.argv[2];

// Run tests
testApi(pdfPath).catch(console.error);