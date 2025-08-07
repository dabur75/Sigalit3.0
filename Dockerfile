# Use Node.js 20 Alpine for better-sqlite3 compatibility
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

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
