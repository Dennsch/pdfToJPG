const fs = require('fs');
const path = require('path');

console.log('=== Build Debug Information ===');
console.log('Current working directory:', process.cwd());
console.log('Node.js version:', process.version);

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
console.log('package.json exists:', fs.existsSync(packageJsonPath));

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('Project name:', packageJson.name);
  console.log('Build script:', packageJson.scripts.build);
}

// Check if tsconfig.json exists
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
console.log('tsconfig.json exists:', fs.existsSync(tsconfigPath));

// Check if node_modules exists
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
console.log('node_modules exists:', fs.existsSync(nodeModulesPath));

// Check if TypeScript is available
try {
  require.resolve('typescript');
  console.log('TypeScript is available');
} catch (e) {
  console.log('TypeScript is NOT available:', e.message);
}

// Check source files
const srcPath = path.join(process.cwd(), 'src');
console.log('src directory exists:', fs.existsSync(srcPath));

if (fs.existsSync(srcPath)) {
  const srcFiles = fs.readdirSync(srcPath, { recursive: true });
  console.log('Source files found:', srcFiles.length);
}

// Check if dist directory exists
const distPath = path.join(process.cwd(), 'dist');
console.log('dist directory exists:', fs.existsSync(distPath));

console.log('=== End Debug Information ===');