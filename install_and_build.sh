#!/bin/bash
cd /workspace
echo "Installing dependencies..."
npm install
echo "Running build..."
npm run build
echo "Build completed!"