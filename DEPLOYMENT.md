# Neureal Deployment Guide

This guide covers deploying the complete Neureal prediction market dApp to production.

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MongoDB
- Redis
- Base network RPC access
- Domain name (for production)

## Quick Start

### 1. Environment Setup

```bash
# Clone and setup
git clone <repository-url>
cd neureal

# Copy environment files
cp .env.example .env
cp contracts/.env.example contracts/.env
cp frontend/.env.example frontend/.env

# Fill in your configuration values
nano .env
```

### 2. Smart Contract Deployment

```bash
# Deploy contracts to Base network
cd contracts
npm install
npm run deploy:base

# Note the deployed contract addresses
# Update .env files with contract addresses
```

### 3. Local Development

```bash
# Start all services with Docker
docker-compose up -d

# Or run individual services
./scripts/deploy.sh --no-contracts
```

### 4. Production Deployment

```bash
# Build and deploy everything
./scripts/deploy.sh

# Or use Docker for production
docker-compose --profile production up -d
```

## Detailed Setup

### Smart Contracts

1. **Configure Hardhat**
   ```bash
   cd contracts
   cp .env.example .env
   # Add your PRIVATE_KEY and RPC_URL
   ```

2. **Deploy Contracts**
   ```bash
   # Compile contracts
   npm run compile
   
   # Deploy to Base mainnet
   npm run deploy:base
   
   # Verify contracts (optional)
   npm run verify
   ```

3. **Save Contract Addresses**
   - Copy the deployed addresses from the console output
   - Update all `.env` files with the contract addresses

### Backend Setup

1. **Database Configuration**
   ```bash
   # Start MongoDB and Redis
   docker-compose up -d mongodb redis
   ```

2. **Environment Variables**
   ```bash
   # Required variables in backend/.env
   MONGODB_URI=mongodb://neureal:neureal_password@localhost:27017/neureal
   REDIS_URL=redis://:neureal_redis_password@localhost:6379
   JWT_SECRET=your_super_secret_jwt_key
   PRIVATE_KEY=your_private_key_without_0x
   RPC_URL=https://mainnet.base.org
   NEURAL_TOKEN_ADDRESS=0x...
   PREDICTION_MARKET_ADDRESS=0x...
   ```

3. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

### Frontend Setup

1. **Environment Configuration**
   ```bash
   # Required variables in frontend/.env
   REACT_APP_API_URL=http://localhost:3001/api/v1
   REACT_APP_WS_URL=ws://localhost:3002
   REACT_APP_CHAIN_ID=8453
   REACT_APP_NEURAL_TOKEN_ADDRESS=0x...
   REACT_APP_PREDICTION_MARKET_ADDRESS=0x...
   REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

2. **Build and Start**
   ```bash
   cd frontend
   npm install
   npm run build
   npm start
   ```

## Production Deployment

### Docker Deployment

1. **Configure Environment**
   ```bash
   # Update .env with production values
   NODE_ENV=production
   REACT_APP_API_URL=https://api.neureal.app/api/v1
   REACT_APP_WS_URL=wss://api.neureal.app
   ```

2. **Deploy with Docker**
   ```bash
   # Build and start all services
   docker-compose --profile production up -d
   
   # Check logs
   docker-compose logs -f
   ```

### Manual Deployment

1. **Server Setup**
   ```bash
   # Install dependencies
   sudo apt update
   sudo apt install nginx mongodb redis-server nodejs npm
   
   # Configure firewall
   sudo ufw allow 80,443,22/tcp
   ```

2. **SSL Certificate**
   ```bash
   # Install certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get certificate
   sudo certbot --nginx -d neureal.app -d www.neureal.app
   ```

3. **Deploy Services**
   ```bash
   # Deploy backend
   cd backend
   npm install --production
   npm run build
   pm2 start dist/server.js --name neureal-backend
   
   # Deploy frontend
   cd frontend
   npm install
   npm run build
   sudo cp -r build/* /var/www/neureal/
   ```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PRIVATE_KEY` | Ethereum private key (no 0x prefix) | Yes |
| `RPC_URL` | Base network RPC endpoint | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `NEURAL_TOKEN_ADDRESS` | Deployed NEURAL token address | Yes |
| `PREDICTION_MARKET_ADDRESS` | Deployed prediction market address | Yes |

### Network Configuration

- **Chain ID**: 8453 (Base Mainnet)
- **RPC URL**: https://mainnet.base.org
- **Block Explorer**: https://basescan.org

### Security Considerations

1. **Private Keys**: Never commit private keys to version control
2. **JWT Secret**: Use a strong, random JWT secret
3. **Database**: Use strong passwords for MongoDB and Redis
4. **SSL**: Always use HTTPS in production
5. **Rate Limiting**: Configure appropriate rate limits
6. **CORS**: Restrict CORS to your domain

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Frontend health
curl http://localhost:3000/health

# Database health
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Application logs
tail -f backend/logs/app.log
tail -f /var/log/nginx/access.log
```

### Metrics

- Monitor contract events on Base network
- Track API response times
- Monitor database performance
- Watch WebSocket connection counts

## Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   - Check private key and RPC URL
   - Ensure sufficient ETH for gas fees
   - Verify network configuration

2. **Backend Won't Start**
   - Check database connections
   - Verify environment variables
   - Check port availability

3. **Frontend Build Fails**
   - Clear node_modules and reinstall
   - Check environment variables
   - Verify contract addresses

4. **WebSocket Connection Issues**
   - Check CORS configuration
   - Verify WebSocket port is open
   - Check proxy configuration

### Support

- **Documentation**: https://docs.neureal.app
- **Discord**: https://discord.gg/neureal
- **GitHub Issues**: https://github.com/neureal/neureal-app/issues

## Maintenance

### Updates

```bash
# Update dependencies
npm audit fix

# Update Docker images
docker-compose pull
docker-compose up -d
```

### Backups

```bash
# Database backup
docker-compose exec mongodb mongodump --out /backup

# Redis backup
docker-compose exec redis redis-cli BGSAVE
```

### Scaling

- Use load balancers for multiple backend instances
- Implement Redis clustering for high availability
- Use CDN for frontend assets
- Monitor and scale based on usage patterns
