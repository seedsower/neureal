# 🚀 Neureal Smart Contract Deployment Guide

## 📋 Prerequisites

### 1. Get Base Testnet ETH
- Visit [Base Bridge](https://bridge.base.org/deposit) 
- Bridge some Sepolia ETH to Base testnet
- Or use [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- You'll need ~0.01 ETH for deployment

### 2. Setup Environment
```bash
cd contracts
cp .env.example .env
```

### 3. Configure .env file
```bash
# Get your private key from MetaMask: Account Details > Export Private Key
PRIVATE_KEY=your_private_key_here

# Optional: Get BaseScan API key for contract verification
BASESCAN_API_KEY=your_basescan_api_key_here
```

## 🚀 Deploy to Base Testnet

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Deploy to Base Sepolia (Testnet)
```bash
npx hardhat run scripts/deploy.js --network base-sepolia
```

## 📊 What Gets Deployed

### 1. **MockPriceOracle**
- Simulates NEURAL token price feeds
- Starting price: $0.1523
- Functions for price updates and simulation

### 2. **NeurealPredictionMarket** 
- Main prediction market contract
- 24-hour prediction rounds
- Minimum bet: 0.001 ETH
- Treasury fee: 3%

## 🎮 Testing Functions

After deployment, you can interact with the contracts:

### Price Oracle Functions
```javascript
// Update price manually
await priceOracle.updatePrice(ethers.parseUnits("0.16", 18));

// Simulate 5% price increase
await priceOracle.simulatePriceMovement(500);

// Random price movement
await priceOracle.randomPriceUpdate();

// Resolve current round
await priceOracle.resolveRound(1);
```

### Prediction Market Functions
```javascript
// Make UP prediction with 0.01 ETH
await predictionMarket.makePrediction(true, { value: ethers.parseEther("0.01") });

// Make DOWN prediction with 0.01 ETH  
await predictionMarket.makePrediction(false, { value: ethers.parseEther("0.01") });

// Get current round info
await predictionMarket.getCurrentRound();

// Get user stats
await predictionMarket.getUserStats(userAddress);

// Claim rewards after round ends
await predictionMarket.claimRewards(roundId);
```

## 📱 Frontend Integration

After deployment, update your frontend with the contract addresses:

```javascript
// Add to your frontend environment
REACT_APP_PREDICTION_MARKET_ADDRESS=0x...
REACT_APP_PRICE_ORACLE_ADDRESS=0x...
REACT_APP_NETWORK_ID=84532  // Base Sepolia
```

## 🔍 Verification

Contracts will be automatically verified on BaseScan if you provide a `BASESCAN_API_KEY`.

## 🎯 Next Steps

1. **Test Predictions**: Make some test predictions on Base testnet
2. **Simulate Price Changes**: Use oracle functions to test different scenarios  
3. **Check Leaderboards**: Test the streak and accuracy tracking
4. **Frontend Integration**: Connect your React app to the deployed contracts

## 📋 Contract Addresses

After deployment, contract addresses will be saved to:
- `deployments/base-sepolia.json`

## 🛠 Troubleshooting

### Low Balance Error
- Get more Base testnet ETH from the faucet
- Minimum 0.01 ETH recommended

### Compilation Errors  
- Run `npm install` to ensure dependencies are installed
- Check Solidity version compatibility

### Deployment Fails
- Verify your private key is correct
- Ensure you have sufficient testnet ETH
- Check network connectivity

## 🎉 Success!

Once deployed, you'll have a fully functional prediction market on Base testnet ready for testing with your React frontend!
