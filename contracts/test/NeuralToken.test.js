const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NeuralToken", function () {
  let neuralToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const NeuralToken = await ethers.getContractFactory("NeuralToken");
    neuralToken = await NeuralToken.deploy(owner.address);
    await neuralToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await neuralToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply to the owner", async function () {
      const ownerBalance = await neuralToken.balanceOf(owner.address);
      expect(await neuralToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct name, symbol, and decimals", async function () {
      expect(await neuralToken.name()).to.equal("Neural Token");
      expect(await neuralToken.symbol()).to.equal("NEURAL");
      expect(await neuralToken.decimals()).to.equal(18);
    });

    it("Should have correct total supply", async function () {
      const expectedSupply = ethers.parseEther("100000000"); // 100 million tokens
      expect(await neuralToken.totalSupply()).to.equal(expectedSupply);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      await neuralToken.transfer(addr1.address, transferAmount);
      const addr1Balance = await neuralToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);

      await neuralToken.connect(addr1).transfer(addr2.address, transferAmount);
      const addr2Balance = await neuralToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await neuralToken.balanceOf(owner.address);
      const transferAmount = initialOwnerBalance + 1n;

      await expect(
        neuralToken.connect(addr1).transfer(owner.address, transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      const initialSupply = await neuralToken.totalSupply();
      
      await neuralToken.mint(addr1.address, mintAmount);
      
      expect(await neuralToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await neuralToken.totalSupply()).to.equal(initialSupply + mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        neuralToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      const transferAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("500");
      
      await neuralToken.transfer(addr1.address, transferAmount);
      const initialBalance = await neuralToken.balanceOf(addr1.address);
      const initialSupply = await neuralToken.totalSupply();
      
      await neuralToken.connect(addr1).burn(burnAmount);
      
      expect(await neuralToken.balanceOf(addr1.address)).to.equal(initialBalance - burnAmount);
      expect(await neuralToken.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should not allow burning more tokens than balance", async function () {
      const burnAmount = ethers.parseEther("1000");
      
      await expect(
        neuralToken.connect(addr1).burn(burnAmount)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
  });

  describe("Pausing", function () {
    it("Should allow owner to pause and unpause", async function () {
      await neuralToken.pause();
      expect(await neuralToken.paused()).to.be.true;
      
      await neuralToken.unpause();
      expect(await neuralToken.paused()).to.be.false;
    });

    it("Should prevent transfers when paused", async function () {
      const transferAmount = ethers.parseEther("1000");
      
      await neuralToken.pause();
      
      await expect(
        neuralToken.transfer(addr1.address, transferAmount)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        neuralToken.connect(addr1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
