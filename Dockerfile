# Use Node.js LTS version
FROM node:18-alpine

# Install system dependencies for pdf2pic
RUN apk add --no-cache \
    ghostscript \
    graphicsmagick \
    poppler-utils

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create directories for uploads and output
RUN mkdir -p uploads output

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]