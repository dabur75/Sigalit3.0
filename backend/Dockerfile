# Sigalit - Production Dockerfile for Fly.io
# Multi-stage build for optimized production image

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S sigalit -u 1001
WORKDIR /app

# Copy dependencies from builder
COPY --from=builder --chown=sigalit:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=sigalit:nodejs . .

# Create data directory for potential file uploads
RUN mkdir -p /app/data && chown sigalit:nodejs /app/data

# Switch to non-root user
USER sigalit

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]