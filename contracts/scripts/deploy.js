const { ethers } = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy NEURAL Token
  console.log("\nDeploying NEURAL Token...");
  const NeuralToken = await ethers.getContractFactory("NeuralToken");
  const neuralToken = await NeuralToken.deploy(deployer.address);
  await neuralToken.waitForDeployment();
  
  const neuralTokenAddress = await neuralToken.getAddress();
  console.log("NEURAL Token deployed to:", neuralTokenAddress);
  
  // Deploy Prediction Market
  console.log("\nDeploying Neureal Prediction Market...");
  const NeurealPredictionMarket = await ethers.getContractFactory("NeurealPredictionMarket");
  const predictionMarket = await NeurealPredictionMarket.deploy(
    neuralTokenAddress,
    deployer.address, // Treasury address
    deployer.address, // Oracle address (can be changed later)
    deployer.address  // Owner address
  );
  await predictionMarket.waitForDeployment();
  
  const predictionMarketAddress = await predictionMarket.getAddress();
  console.log("Neureal Prediction Market deployed to:", predictionMarketAddress);
  
  // Verify token details
  const tokenName = await neuralToken.name();
  const tokenSymbol = await neuralToken.symbol();
  const tokenDecimals = await neuralToken.decimals();
  const totalSupply = await neuralToken.totalSupply();
  
  console.log("\n=== Deployment Summary ===");
  console.log("NEURAL Token:");
  console.log("  Address:", neuralTokenAddress);
  console.log("  Name:", tokenName);
  console.log("  Symbol:", tokenSymbol);
  console.log("  Decimals:", tokenDecimals);
  console.log("  Total Supply:", ethers.formatEther(totalSupply), "NEURAL");
  
  console.log("\nPrediction Market:");
  console.log("  Address:", predictionMarketAddress);
  console.log("  Token Address:", neuralTokenAddress);
  console.log("  Treasury Address:", deployer.address);
  console.log("  Oracle Address:", deployer.address);
  console.log("  Owner Address:", deployer.address);
  
  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    neuralToken: neuralTokenAddress,
    predictionMarket: predictionMarketAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString()
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
    console.log("\nWaiting for block confirmations...");
    await neuralToken.deploymentTransaction().wait(5);
    await predictionMarket.deploymentTransaction().wait(5);
    
    console.log("\nVerifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: neuralTokenAddress,
        constructorArguments: [deployer.address],
      });
      console.log("NEURAL Token verified");
    } catch (error) {
      console.log("NEURAL Token verification failed:", error.message);
    }
    
    try {
      await hre.run("verify:verify", {
        address: predictionMarketAddress,
        constructorArguments: [
          neuralTokenAddress,
          deployer.address,
          deployer.address,
          deployer.address
        ],
      });
      console.log("Prediction Market verified");
    } catch (error) {
      console.log("Prediction Market verification failed:", error.message);
    }
  }
  
  console.log("\n✅ Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
