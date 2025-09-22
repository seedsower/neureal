// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockPriceOracle
 * @dev A mock price oracle for testing the Neureal prediction market
 */
contract MockPriceOracle is Ownable {
    
    struct PriceData {
        uint256 price;
        uint256 timestamp;
    }
    
    mapping(uint256 => PriceData) public priceHistory;
    uint256 public currentPrice;
    uint256 public lastUpdateTime;
    uint256 public priceUpdateCount;
    
    address public predictionMarket;
    
    event PriceUpdated(uint256 indexed timestamp, uint256 price);
    event MarketResolved(uint256 indexed roundId, uint256 endPrice);
    
    constructor(uint256 _initialPrice) Ownable(msg.sender) {
        currentPrice = _initialPrice;
        lastUpdateTime = block.timestamp;
        priceHistory[priceUpdateCount] = PriceData(_initialPrice, block.timestamp);
    }
    
    /**
     * @dev Set the prediction market contract address
     */
    function setPredictionMarket(address _predictionMarket) external onlyOwner {
        predictionMarket = _predictionMarket;
    }
    
    /**
     * @dev Update the current price (for testing)
     */
    function updatePrice(uint256 _price) external onlyOwner {
        _updatePrice(_price);
    }
    
    /**
     * @dev Simulate price movement for testing
     */
    function simulatePriceMovement(int256 changePercent) external onlyOwner {
        require(changePercent >= -5000 && changePercent <= 5000, "Change too large"); // Max 50% change
        
        uint256 newPrice;
        if (changePercent >= 0) {
            newPrice = currentPrice + (currentPrice * uint256(changePercent)) / 10000;
        } else {
            uint256 decrease = (currentPrice * uint256(-changePercent)) / 10000;
            newPrice = currentPrice > decrease ? currentPrice - decrease : currentPrice / 2;
        }
        
        _updatePrice(newPrice);
    }
    
    /**
     * @dev Internal function to update price
     */
    function _updatePrice(uint256 _price) internal {
        currentPrice = _price;
        lastUpdateTime = block.timestamp;
        priceUpdateCount++;
        
        priceHistory[priceUpdateCount] = PriceData(_price, block.timestamp);
        
        emit PriceUpdated(block.timestamp, _price);
    }
    
    /**
     * @dev Get the current price
     */
    function getPrice() external view returns (uint256) {
        return currentPrice;
    }
    
    /**
     * @dev Get price at a specific timestamp (approximate)
     */
    function getPriceAtTime(uint256 timestamp) external view returns (uint256) {
        // Simple implementation - in production would use Chainlink or similar
        if (timestamp <= lastUpdateTime) {
            return currentPrice;
        }
        return 0; // Future price not available
    }
    
    /**
     * @dev Resolve a round in the prediction market
     */
    function resolveRound(uint256 roundId) external onlyOwner {
        require(predictionMarket != address(0), "Prediction market not set");
        
        // Call the prediction market to resolve the round
        (bool success, ) = predictionMarket.call(
            abi.encodeWithSignature("resolveRound(uint256)", currentPrice)
        );
        require(success, "Failed to resolve round");
        
        emit MarketResolved(roundId, currentPrice);
    }
    
    /**
     * @dev Set starting price for current round
     */
    function setStartingPrice() external onlyOwner {
        require(predictionMarket != address(0), "Prediction market not set");
        
        (bool success, ) = predictionMarket.call(
            abi.encodeWithSignature("setStartPrice(uint256)", currentPrice)
        );
        require(success, "Failed to set start price");
    }
    
    /**
     * @dev Get price history
     */
    function getPriceHistory(uint256 count) 
        external 
        view 
        returns (uint256[] memory prices, uint256[] memory timestamps) 
    {
        uint256 length = count > priceUpdateCount ? priceUpdateCount + 1 : count;
        prices = new uint256[](length);
        timestamps = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            uint256 index = priceUpdateCount >= i ? priceUpdateCount - i : 0;
            prices[i] = priceHistory[index].price;
            timestamps[i] = priceHistory[index].timestamp;
        }
    }
    
    /**
     * @dev Generate random price movement for testing
     */
    function randomPriceUpdate() external onlyOwner {
        // Simple pseudo-random price movement for testing
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, currentPrice)));
        int256 changePercent = int256((randomSeed % 1000) - 500); // -5% to +5%
        
        // Apply the price change directly
        uint256 newPrice;
        if (changePercent >= 0) {
            newPrice = currentPrice + (currentPrice * uint256(changePercent)) / 10000;
        } else {
            uint256 decrease = (currentPrice * uint256(-changePercent)) / 10000;
            newPrice = currentPrice > decrease ? currentPrice - decrease : currentPrice / 2;
        }
        
        _updatePrice(newPrice);
    }
}
