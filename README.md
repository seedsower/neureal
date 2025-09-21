# Neureal - Web3 Prediction Market dApp

A complete decentralized prediction market where users stake NEURAL tokens to predict if the NEURAL token price will go UP or DOWN in 24-hour rounds. Built on Base network with modern Web3 technologies.

## 🚀 Features

### Core Functionality
- **24-Hour Prediction Rounds**: Structured prediction cycles with automatic resolution
- **Binary Predictions**: Simple UP/DOWN price predictions for NEURAL token
- **Token Staking**: Stake 1-100,000 NEURAL tokens per prediction
- **Proportional Rewards**: Winners share the losing pool based on stake size
- **1% Platform Fee**: Sustainable fee structure on winnings only

### Smart Contracts
- **NEURAL ERC20 Token**: 100M supply with standard ERC20 functionality
- **Prediction Market Contract**: Handles rounds, predictions, and reward distribution
- **Automated Resolution**: 24-hour rounds with automatic price locking and resolution
- **Security Features**: Reentrancy protection, pausable contracts, access controls

### Backend Services
- **RESTful API**: Comprehensive endpoints for all dApp functionality
- **Real-time WebSocket**: Live price updates and round notifications
- **Cron Jobs**: Automated round management and analytics
- **JWT Authentication**: Wallet-based authentication system
- **Redis Caching**: High-performance data caching
- **MongoDB Storage**: Persistent data storage for users and predictions

### Frontend Experience
- **Modern React UI**: TypeScript-based React application
- **Glassmorphism Design**: Dark theme with backdrop blur effects
- **Wallet Integration**: MetaMask and WalletConnect support
- **Real-time Updates**: Live price charts and prediction data
- **Mobile Responsive**: Optimized for all device sizes
- **Smooth Animations**: Framer Motion powered transitions

## 🛠 Tech Stack

### Blockchain
- **Solidity** - Smart contract development
- **Hardhat** - Development framework and deployment
- **OpenZeppelin** - Security-audited contract libraries
- **Base Network** - Low-cost Ethereum L2 for deployment

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **ethers.js** - Ethereum interaction library
- **Socket.io** - Real-time WebSocket communication
- **MongoDB** - Document database
- **Redis** - In-memory caching
- **JWT** - Authentication tokens
- **node-cron** - Scheduled task execution

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **RainbowKit** - Wallet connection
- **Wagmi** - React hooks for Ethereum
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **Chart.js** - Data visualization

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **Docker Compose** - Multi-container orchestration

## 📁 Project Structure

```
neureal/
├── contracts/              # Smart contracts
│   ├── contracts/         # Solidity contracts
│   ├── scripts/          # Deployment scripts
│   ├── test/             # Contract tests
│   └── deployments/      # Deployment artifacts
├── backend/               # Node.js backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── logs/             # Application logs
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # State management
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
├── scripts/               # Deployment scripts
├── nginx/                # Nginx configuration
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB
- Redis
- Web3 wallet (MetaMask recommended)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd neureal

# Copy environment files
cp .env.example .env
cp contracts/.env.example contracts/.env
cp frontend/.env.example frontend/.env
```

### 2. Configure Environment
Edit the `.env` files with your configuration:
```bash
# Blockchain
PRIVATE_KEY=your_private_key_without_0x
RPC_URL=https://mainnet.base.org
CHAIN_ID=8453

# Database
MONGODB_URI=mongodb://localhost:27017/neureal
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_super_secret_jwt_key
```

### 3. Deploy Smart Contracts
```bash
cd contracts
npm install
npm run compile
npm run deploy:base
# Note the contract addresses for frontend configuration
```

### 4. Start Services

#### Option A: Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Option B: Manual Setup
```bash
# Start databases
docker-compose up -d mongodb redis

# Start backend
cd backend
npm install
npm run dev

# Start frontend (new terminal)
cd frontend
npm install
npm start
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## 🔧 Development

### Running Tests
```bash
# Smart contract tests
cd contracts
npm test

# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Formatting
npm run format
```

## 📚 API Documentation

### Authentication
```bash
# Get nonce for wallet
POST /api/v1/auth/nonce
{
  "address": "0x..."
}

# Verify signature
POST /api/v1/auth/verify
{
  "address": "0x...",
  "signature": "0x...",
  "nonce": "123456"
}
```

### Predictions
```bash
# Make prediction
POST /api/v1/predictions
{
  "roundId": 1,
  "position": "UP",
  "amount": "100",
  "transactionHash": "0x..."
}

# Get user predictions
GET /api/v1/predictions

# Claim reward
POST /api/v1/predictions/{roundId}/claim
```

### Rounds
```bash
# Get current round
GET /api/v1/rounds/current

# Get round history
GET /api/v1/rounds?page=1&limit=20

# Get round details
GET /api/v1/rounds/{roundId}
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Production Deployment
```bash
# Quick production deployment
./scripts/deploy.sh

# Docker production
docker-compose --profile production up -d
```

## 🔐 Security Features

- **Smart Contract Security**: OpenZeppelin libraries, reentrancy protection
- **Authentication**: JWT tokens with wallet signature verification
- **Rate Limiting**: API and authentication rate limits
- **Input Validation**: Comprehensive input sanitization
- **HTTPS**: SSL/TLS encryption in production
- **CORS**: Proper cross-origin resource sharing configuration

## 🎯 User Flow

1. **Connect Wallet**: Users connect MetaMask or WalletConnect
2. **View Current Round**: See active round with price and statistics
3. **Make Prediction**: Choose UP/DOWN and stake NEURAL tokens
4. **Wait for Resolution**: Round locks after 24 hours, resolves after another 24 hours
5. **Claim Rewards**: Winners claim their proportional share of the losing pool

## 📊 Key Metrics

- **Minimum Stake**: 1 NEURAL token
- **Maximum Stake**: 100,000 NEURAL tokens
- **Round Duration**: 24 hours active + 24 hours locked
- **Platform Fee**: 1% on winnings only
- **Token Supply**: 100,000,000 NEURAL tokens

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: https://neureal.app
- **Documentation**: https://docs.neureal.app
- **Discord**: https://discord.gg/neureal
- **Twitter**: https://twitter.com/neurealapp
- **GitHub**: https://github.com/neureal/neureal-app

## ⚠️ Disclaimer

This is a decentralized application involving financial predictions. Users should:
- Only invest what they can afford to lose
- Understand the risks of cryptocurrency trading
- Be aware that predictions can result in total loss of staked tokens
- Ensure compliance with local regulations

The platform is provided "as is" without warranties of any kind.
