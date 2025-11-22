const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking workspace...');
console.log('Current directory:', process.cwd());

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
console.log('node_modules exists:', fs.existsSync(nodeModulesPath));

// Try to install dependencies
try {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: process.cwd() });
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
  process.exit(1);
}

// Try to run build
try {
  console.log('Running build...');
  execSync('npm run build', { stdio: 'inherit', cwd: process.cwd() });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}