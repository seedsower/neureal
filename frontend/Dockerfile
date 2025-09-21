# Frontend Dockerfile for Neureal
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_API_URL
ARG REACT_APP_WS_URL
ARG REACT_APP_CHAIN_ID
ARG REACT_APP_NEURAL_TOKEN_ADDRESS
ARG REACT_APP_PREDICTION_MARKET_ADDRESS
ARG REACT_APP_WALLETCONNECT_PROJECT_ID

# Set environment variables
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL
ENV REACT_APP_CHAIN_ID=$REACT_APP_CHAIN_ID
ENV REACT_APP_NEURAL_TOKEN_ADDRESS=$REACT_APP_NEURAL_TOKEN_ADDRESS
ENV REACT_APP_PREDICTION_MARKET_ADDRESS=$REACT_APP_PREDICTION_MARKET_ADDRESS
ENV REACT_APP_WALLETCONNECT_PROJECT_ID=$REACT_APP_WALLETCONNECT_PROJECT_ID

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx
RUN adduser -S neureal -u 1001

# Set proper permissions
RUN chown -R neureal:nginx /usr/share/nginx/html
RUN chown -R neureal:nginx /var/cache/nginx
RUN chown -R neureal:nginx /var/log/nginx
RUN chown -R neureal:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R neureal:nginx /var/run/nginx.pid

USER neureal

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
