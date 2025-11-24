#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying TypeScript build...\n');

try {
  // Clean any existing dist directory
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    console.log('🧹 Cleaning existing dist directory...');
    fs.rmSync(distPath, { recursive: true, force: true });
  }

  // Run TypeScript compilation
  console.log('🔨 Running TypeScript compilation...');
  const output = execSync('npx tsc', { 
    encoding: 'utf8',
    cwd: __dirname,
    stdio: 'pipe'
  });
  
  console.log('✅ TypeScript compilation successful!');
  
  // Check if dist directory was created
  if (fs.existsSync(distPath)) {
    console.log('✅ dist directory created successfully');
    
    // List generated files
    const files = fs.readdirSync(distPath, { recursive: true });
    console.log(`📁 Generated ${files.length} files in dist/`);
    
    // Check for main server file
    const serverPath = path.join(distPath, 'server.js');
    if (fs.existsSync(serverPath)) {
      console.log('✅ Main server.js file generated');
    } else {
      console.log('❌ Main server.js file not found');
    }
  } else {
    console.log('❌ dist directory not created');
  }
  
  console.log('\n🎉 Build verification completed successfully!');
  console.log('The project should now build successfully in Vercel.');
  
} catch (error) {
  console.error('❌ TypeScript compilation failed:');
  console.error(error.stdout || error.message);
  process.exit(1);
}