# Deploying Neureal to Netlify

This guide will help you deploy the Neureal dApp frontend to Netlify with mock backend functionality.

## 🚀 Quick Deploy

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub** (already done):
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your `neureal` repository
   - Netlify will automatically detect the `netlify.toml` configuration

3. **Deploy Settings** (auto-configured):
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/build`
   - **Node version**: 18

### Option 2: Manual Deploy

1. **Build the frontend locally**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `frontend/build` folder to Netlify

## 🔧 Configuration

### Environment Variables

The following environment variables are configured in `netlify.toml`:

```toml
REACT_APP_API_URL = "/.netlify/functions/mock-api"
REACT_APP_WS_URL = "wss://echo.websocket.org"
REACT_APP_CHAIN_ID = "8453"
REACT_APP_CHAIN_NAME = "Base"
REACT_APP_ENABLE_ANALYTICS = "true"
REACT_APP_ENABLE_NOTIFICATIONS = "true"
```

### Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Add your custom domain (e.g., `neureal.app`)
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

## 🛠 Features on Netlify

### ✅ What Works
- **Frontend React App**: Complete UI with all pages and components
- **Mock API**: Serverless functions providing demo data
- **Wallet Connection**: MetaMask and WalletConnect integration
- **Responsive Design**: Mobile and desktop optimized
- **Real-time Updates**: Simulated price updates
- **SPA Routing**: React Router with proper redirects

### 🔄 Mock Backend Features
- **Current Round Data**: Simulated 24-hour prediction rounds
- **Platform Statistics**: Mock user and volume data
- **Authentication**: Demo wallet signature flow
- **Predictions**: Mock prediction submission
- **Leaderboards**: Sample leaderboard data

### ⚠️ Limitations (Demo Mode)
- **No Real Blockchain**: Contract interactions are simulated
- **No Database**: Data is not persisted between sessions
- **No Real WebSocket**: Uses echo service for demo
- **No User Accounts**: Authentication is demo only

## 📊 Netlify Functions

The deployment includes serverless functions:

### `/api/v1/rounds/current`
Returns current round information with mock data.

### `/api/v1/stats/platform`
Provides platform statistics and metrics.

### `/api/v1/auth/nonce`
Handles wallet authentication nonce generation.

### `/api/v1/predictions`
Manages prediction submissions (demo mode).

### `/api/v1/leaderboard/top-winners`
Returns leaderboard data.

## 🔧 Advanced Configuration

### Custom Build Settings

If you need to customize the build, update `netlify.toml`:

```toml
[build]
  command = "cd frontend && npm install && npm run build"
  publish = "frontend/build"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"
```

### Environment Variables in Netlify UI

You can also set environment variables in the Netlify dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add variables:
   - `REACT_APP_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
   - `REACT_APP_NEURAL_TOKEN_ADDRESS`: Deployed token address
   - `REACT_APP_PREDICTION_MARKET_ADDRESS`: Deployed contract address

### Headers and Security

Security headers are configured in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Content-Security-Policy = "default-src 'self'; ..."
```

## 🚀 Production Deployment

For a full production deployment with real backend:

1. **Deploy Backend**: Use Heroku, Railway, or AWS for the Node.js backend
2. **Deploy Database**: Use MongoDB Atlas or similar
3. **Update Environment**: Point `REACT_APP_API_URL` to your backend
4. **Deploy Contracts**: Deploy smart contracts to Base network
5. **Update Contract Addresses**: Set real contract addresses in environment

### Example Production Environment

```bash
REACT_APP_API_URL=https://your-backend.herokuapp.com/api/v1
REACT_APP_WS_URL=wss://your-backend.herokuapp.com
REACT_APP_NEURAL_TOKEN_ADDRESS=0xYourTokenAddress
REACT_APP_PREDICTION_MARKET_ADDRESS=0xYourContractAddress
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 📈 Monitoring

### Netlify Analytics
- Enable Netlify Analytics for traffic insights
- Monitor build logs and function invocations
- Set up form notifications for errors

### Performance
- Netlify automatically optimizes images and assets
- CDN distribution for global performance
- Automatic HTTPS and HTTP/2

## 🔗 Useful Links

- **Netlify Dashboard**: https://app.netlify.com
- **Build Logs**: Available in your site dashboard
- **Function Logs**: Monitor serverless function performance
- **Domain Settings**: Configure custom domains and SSL

## 🆘 Troubleshooting

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Review build logs in Netlify dashboard

### Environment Variables
- Ensure all `REACT_APP_` prefixed variables are set
- Check for typos in variable names
- Verify values don't contain sensitive information

### Function Errors
- Check function logs in Netlify dashboard
- Verify CORS headers are properly set
- Test functions locally with Netlify CLI

### Deploy Command
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from local
netlify deploy --prod --dir=frontend/build
```

## 🎉 Success!

Once deployed, your Neureal dApp will be available at:
- **Netlify URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

The dApp will showcase the complete user interface and experience of the Neureal prediction market platform!
