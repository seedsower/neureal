# Backend Dockerfile for Neureal
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S neureal -u 1001

# Copy built application
COPY --from=builder --chown=neureal:nodejs /app/dist ./dist
COPY --from=builder --chown=neureal:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=neureal:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown neureal:nodejs logs

USER neureal

EXPOSE 3001 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
