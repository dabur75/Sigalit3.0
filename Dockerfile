# Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Production stage
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install only production dependencies and rebuild native modules
RUN npm ci --only=production && npm rebuild better-sqlite3

# Copy backend source code
COPY backend/ ./

# Copy frontend files to serve as static content
COPY frontend/ ./public/

# Create directory for database
RUN mkdir -p /app/data

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Start the application
CMD ["node", "app.js"]
