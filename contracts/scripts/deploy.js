const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Neureal dApp deployment to Base testnet...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.01")) {
    console.log("⚠️  Warning: Low balance. You may need more testnet ETH for deployment.");
    console.log("💡 Get Base testnet ETH from: https://bridge.base.org/deposit");
  }
  
  // Deploy Mock Price Oracle first
  console.log("\n📊 Deploying Mock Price Oracle...");
  const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
  const initialPrice = ethers.parseUnits("0.1523", 18); // Starting NEURAL price: $0.1523
  const priceOracle = await MockPriceOracle.deploy(initialPrice);
  await priceOracle.waitForDeployment();
  
  const priceOracleAddress = await priceOracle.getAddress();
  console.log("✅ Mock Price Oracle deployed to:", priceOracleAddress);
  console.log("   Initial NEURAL price: $0.1523");
  
  // Deploy Prediction Market
  console.log("\n🎯 Deploying Neureal Prediction Market...");
  const NeurealPredictionMarket = await ethers.getContractFactory("NeurealPredictionMarket");
  const predictionMarket = await NeurealPredictionMarket.deploy(
    priceOracleAddress, // Price oracle address
    deployer.address    // Treasury address
  );
  await predictionMarket.waitForDeployment();
  
  const predictionMarketAddress = await predictionMarket.getAddress();
  console.log("✅ Neureal Prediction Market deployed to:", predictionMarketAddress);
  
  // Connect oracle to prediction market
  console.log("\n🔗 Connecting contracts...");
  await priceOracle.setPredictionMarket(predictionMarketAddress);
  console.log("✅ Price oracle connected to prediction market");
  
  // Set starting price for the first round
  await priceOracle.setStartingPrice();
  console.log("✅ Starting price set for first round");
  
  // Get contract details
  const currentPrice = await priceOracle.getPrice();
  const currentRound = await predictionMarket.getCurrentRound();
  const minimumBet = await predictionMarket.minimumBet();
  
  console.log("\n🎉 === Deployment Summary ===");
  console.log("📊 Mock Price Oracle:");
  console.log("  Address:", priceOracleAddress);
  console.log("  Current NEURAL Price: $" + ethers.formatUnits(currentPrice, 18));
  console.log("  Owner:", deployer.address);
  
  console.log("\n🎯 Neureal Prediction Market:");
  console.log("  Address:", predictionMarketAddress);
  console.log("  Oracle Address:", priceOracleAddress);
  console.log("  Treasury Address:", deployer.address);
  console.log("  Owner Address:", deployer.address);
  console.log("  Current Round ID:", currentRound[0].toString());
  console.log("  Minimum Bet:", ethers.formatEther(minimumBet), "ETH");
  
  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    priceOracle: priceOracleAddress,
    predictionMarket: predictionMarketAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    initialPrice: ethers.formatUnits(currentPrice, 18),
    minimumBet: ethers.formatEther(minimumBet),
    currentRound: currentRound[0].toString()
  };
  
  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log(`\nDeployment info saved to deployments/${hre.network.name}.json`);
  
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await priceOracle.deploymentTransaction().wait(5);
    await predictionMarket.deploymentTransaction().wait(5);
    
    console.log("\n🔍 Verifying contracts on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: priceOracleAddress,
        constructorArguments: [initialPrice],
      });
      console.log("✅ Mock Price Oracle verified");
    } catch (error) {
      console.log("❌ Mock Price Oracle verification failed:", error.message);
    }
    
    try {
      await hre.run("verify:verify", {
        address: predictionMarketAddress,
        constructorArguments: [
          priceOracleAddress,
          deployer.address
        ],
      });
      console.log("✅ Prediction Market verified");
    } catch (error) {
      console.log("❌ Prediction Market verification failed:", error.message);
    }
  }
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Update frontend with contract addresses:");
  console.log("   - Prediction Market:", predictionMarketAddress);
  console.log("   - Price Oracle:", priceOracleAddress);
  console.log("2. Test making predictions on Base testnet");
  console.log("3. Use oracle functions to simulate price changes");
  console.log("4. Monitor user stats and leaderboard functionality");
  
  console.log("\n📋 Oracle Management Commands:");
  console.log("- Update price: priceOracle.updatePrice(newPrice)");
  console.log("- Simulate movement: priceOracle.simulatePriceMovement(changePercent)");
  console.log("- Random update: priceOracle.randomPriceUpdate()");
  console.log("- Resolve round: priceOracle.resolveRound(roundId)");
  
  console.log("\n✅ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
