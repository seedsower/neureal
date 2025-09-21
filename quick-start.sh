#!/bin/bash

# Quick Start Neureal dApp Demo
echo "🚀 Starting Neureal dApp Demo..."

# Create a simple demo server
cat > demo-server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Serve the demo HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Neureal - Web3 Prediction Market</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            400: '#8b5cf6',
                            500: '#7c3aed',
                            600: '#6d28d9'
                        },
                        success: {
                            400: '#4ade80',
                            500: '#22c55e'
                        },
                        danger: {
                            400: '#f87171',
                            500: '#ef4444'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .gradient-text { background: linear-gradient(45deg, #8b5cf6, #d946ef); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); } 50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); } }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <!-- Header -->
    <header class="border-b border-gray-700 bg-gray-900/80 backdrop-blur-md">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full"></div>
                    <h1 class="text-2xl font-bold gradient-text">Neureal</h1>
                </div>
                <button class="bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg font-semibold transition-colors">
                    Connect Wallet
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-6 py-8">
        <!-- Hero Section -->
        <div class="text-center mb-12">
            <h2 class="text-4xl md:text-6xl font-bold mb-6 gradient-text">
                Web3 Prediction Market
            </h2>
            <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Stake NEURAL tokens to predict price movements in 24-hour rounds
            </p>
            
            <!-- Price Display -->
            <div class="glass rounded-xl p-6 max-w-md mx-auto mb-8 animate-pulse-glow">
                <div class="text-sm text-gray-400 mb-2">NEURAL Price</div>
                <div class="text-3xl font-bold text-white mb-2" id="price">$0.150000</div>
                <div class="flex items-center justify-center space-x-2">
                    <span class="text-success-400" id="change">+2.34%</span>
                    <div class="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                    <span class="text-xs text-gray-500">LIVE</span>
                </div>
            </div>
        </div>

        <!-- Current Round -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <!-- Round Info -->
            <div class="lg:col-span-2">
                <div class="glass rounded-xl p-6">
                    <h3 class="text-xl font-bold mb-4">Current Round #1</h3>
                    
                    <!-- Timer -->
                    <div class="mb-6">
                        <div class="text-sm text-gray-400 mb-2">Time Remaining</div>
                        <div class="text-2xl font-bold text-primary-400" id="timer">23:45:32</div>
                    </div>
                    
                    <!-- Pool Distribution -->
                    <div class="space-y-4">
                        <h4 class="font-semibold text-gray-300">Pool Distribution</h4>
                        
                        <!-- UP Pool -->
                        <div class="flex items-center justify-between p-3 bg-success-500/10 border border-success-500/20 rounded-lg">
                            <div class="flex items-center">
                                <div class="w-5 h-5 text-success-400 mr-2">↑</div>
                                <span class="font-medium text-success-300">UP</span>
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-success-300">1,250 NEURAL</div>
                                <div class="text-xs text-success-400">62.5%</div>
                            </div>
                        </div>

                        <!-- DOWN Pool -->
                        <div class="flex items-center justify-between p-3 bg-danger-500/10 border border-danger-500/20 rounded-lg">
                            <div class="flex items-center">
                                <div class="w-5 h-5 text-danger-400 mr-2">↓</div>
                                <span class="font-medium text-danger-300">DOWN</span>
                            </div>
                            <div class="text-right">
                                <div class="text-sm text-danger-300">750 NEURAL</div>
                                <div class="text-xs text-danger-400">37.5%</div>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div class="absolute left-0 top-0 h-full bg-success-500 rounded-full" style="width: 62.5%"></div>
                            <div class="absolute right-0 top-0 h-full bg-danger-500 rounded-full" style="width: 37.5%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Prediction Interface -->
            <div class="glass rounded-xl p-6">
                <h3 class="text-xl font-bold mb-4">Make Prediction</h3>
                
                <!-- Position Selection -->
                <div class="grid grid-cols-2 gap-3 mb-6">
                    <button class="p-4 border-2 border-gray-600 hover:border-success-500 rounded-lg transition-all text-center" onclick="selectPosition('UP')">
                        <div class="text-success-400 text-2xl mb-2">↑</div>
                        <div class="font-semibold">UP</div>
                        <div class="text-xs text-gray-400">Price increases</div>
                    </button>
                    <button class="p-4 border-2 border-gray-600 hover:border-danger-500 rounded-lg transition-all text-center" onclick="selectPosition('DOWN')">
                        <div class="text-danger-400 text-2xl mb-2">↓</div>
                        <div class="font-semibold">DOWN</div>
                        <div class="text-xs text-gray-400">Price decreases</div>
                    </button>
                </div>

                <!-- Amount Input -->
                <div class="mb-6">
                    <label class="block text-sm text-gray-300 mb-2">Stake Amount</label>
                    <input type="number" placeholder="Enter amount" class="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white" min="1" max="100000">
                    <div class="text-xs text-gray-500 mt-1">Min: 1 NEURAL • Max: 100,000 NEURAL</div>
                </div>

                <!-- Submit Button -->
                <button class="w-full bg-primary-600 hover:bg-primary-700 py-3 rounded-lg font-semibold transition-colors" onclick="makePrediction()">
                    Connect Wallet to Predict
                </button>
            </div>
        </div>

        <!-- Features -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="glass rounded-xl p-6 text-center">
                <div class="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">⏰</span>
                </div>
                <h4 class="font-semibold mb-2">24-Hour Rounds</h4>
                <p class="text-gray-400 text-sm">Structured prediction cycles with automatic resolution</p>
            </div>
            
            <div class="glass rounded-xl p-6 text-center">
                <div class="w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">💰</span>
                </div>
                <h4 class="font-semibold mb-2">Stake & Earn</h4>
                <p class="text-gray-400 text-sm">Winners share the losing pool proportionally</p>
            </div>
            
            <div class="glass rounded-xl p-6 text-center">
                <div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">🏆</span>
                </div>
                <h4 class="font-semibold mb-2">Compete</h4>
                <p class="text-gray-400 text-sm">Climb leaderboards and compete with traders</p>
            </div>
        </div>
    </main>

    <script>
        // Simulate live price updates
        let price = 0.150000;
        let change = 2.34;
        
        function updatePrice() {
            // Random price movement
            const movement = (Math.random() - 0.5) * 0.002;
            price += movement;
            change = ((price - 0.150000) / 0.150000) * 100;
            
            document.getElementById('price').textContent = '$' + price.toFixed(6);
            const changeEl = document.getElementById('change');
            changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
            changeEl.className = change >= 0 ? 'text-success-400' : 'text-danger-400';
        }
        
        // Update timer
        let timeLeft = 23 * 3600 + 45 * 60 + 32; // 23:45:32
        function updateTimer() {
            const hours = Math.floor(timeLeft / 3600);
            const minutes = Math.floor((timeLeft % 3600) / 60);
            const seconds = timeLeft % 60;
            
            document.getElementById('timer').textContent = 
                hours.toString().padStart(2, '0') + ':' +
                minutes.toString().padStart(2, '0') + ':' +
                seconds.toString().padStart(2, '0');
            
            timeLeft--;
            if (timeLeft < 0) timeLeft = 24 * 3600; // Reset to 24 hours
        }
        
        function selectPosition(position) {
            console.log('Selected position:', position);
            // Add visual feedback here
        }
        
        function makePrediction() {
            alert('Demo Mode: In the full dApp, this would connect your wallet and submit the prediction to the blockchain!');
        }
        
        // Start updates
        setInterval(updatePrice, 3000); // Update price every 3 seconds
        setInterval(updateTimer, 1000); // Update timer every second
        
        console.log('🚀 Neureal dApp Demo Loaded!');
        console.log('📊 This is a visual demo of the prediction market interface');
        console.log('🔗 Full dApp includes blockchain integration, real-time WebSocket updates, and more!');
    </script>
</body>
</html>
  `);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Neureal Demo running at http://localhost:${PORT}`);
  console.log('📊 This is a visual demo of the dApp interface');
  console.log('🔗 Full version includes blockchain integration!');
});
EOF

# Check if Express is available
if ! node -e "require('express')" 2>/dev/null; then
    echo "📦 Installing Express..."
    npm install express
fi

echo "🌐 Starting demo server..."
node demo-server.js
