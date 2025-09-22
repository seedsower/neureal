// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NeurealPredictionMarket
 * @dev A prediction market contract for NEURAL token price predictions
 */
contract NeurealPredictionMarket is ReentrancyGuard, Ownable, Pausable {
    
    constructor(address _priceOracle, address _treasury) Ownable(msg.sender) {
        priceOracle = _priceOracle;
        treasury = _treasury;
        currentRoundId = 1;
        _startRound();
    }
    
    struct Round {
        uint256 roundId;
        uint256 startTime;
        uint256 endTime;
        uint256 lockTime;
        uint256 startPrice;
        uint256 endPrice;
        uint256 upAmount;
        uint256 downAmount;
        uint256 totalAmount;
        bool resolved;
        bool upWins;
    }
    
    struct Prediction {
        uint256 amount;
        bool isUp;
        bool claimed;
    }
    
    struct UserStats {
        uint256 totalPredictions;
        uint256 correctPredictions;
        uint256 currentStreak;
        uint256 bestStreak;
        uint256 totalWinnings;
        uint256 totalStaked;
    }
    
    // State variables
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => Prediction)) public predictions;
    mapping(address => UserStats) public userStats;
    
    uint256 public currentRoundId;
    uint256 public roundDuration = 24 hours; // 24 hour rounds
    uint256 public lockDuration = 1 hours; // Lock 1 hour before end
    uint256 public minimumBet = 0.001 ether; // Minimum bet amount
    uint256 public treasuryFee = 300; // 3% fee (300 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    address public priceOracle;
    address public treasury;
    
    // Events
    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 endTime);
    event PredictionMade(address indexed user, uint256 indexed roundId, uint256 amount, bool isUp);
    event RoundResolved(uint256 indexed roundId, uint256 endPrice, bool upWins);
    event RewardsClaimed(address indexed user, uint256 indexed roundId, uint256 amount);
    event PriceOracleUpdated(address indexed newOracle);
    
    /**
     * @dev Make a prediction for the current round
     * @param isUp True for UP prediction, false for DOWN
     */
    function makePrediction(bool isUp) external payable nonReentrant whenNotPaused {
        require(msg.value >= minimumBet, "Bet amount too small");
        
        Round storage round = rounds[currentRoundId];
        require(block.timestamp < round.lockTime, "Round locked");
        require(predictions[currentRoundId][msg.sender].amount == 0, "Already predicted");
        
        // Record prediction
        predictions[currentRoundId][msg.sender] = Prediction({
            amount: msg.value,
            isUp: isUp,
            claimed: false
        });
        
        // Update round totals
        round.totalAmount += msg.value;
        if (isUp) {
            round.upAmount += msg.value;
        } else {
            round.downAmount += msg.value;
        }
        
        // Update user stats
        userStats[msg.sender].totalPredictions++;
        userStats[msg.sender].totalStaked += msg.value;
        
        emit PredictionMade(msg.sender, currentRoundId, msg.value, isUp);
    }
    
    /**
     * @dev Resolve the current round and start a new one
     * @param endPrice The final price for the round
     */
    function resolveRound(uint256 endPrice) external {
        require(msg.sender == priceOracle || msg.sender == owner(), "Not authorized");
        
        Round storage round = rounds[currentRoundId];
        require(block.timestamp >= round.endTime, "Round not ended");
        require(!round.resolved, "Already resolved");
        
        round.endPrice = endPrice;
        round.resolved = true;
        round.upWins = endPrice > round.startPrice;
        
        emit RoundResolved(currentRoundId, endPrice, round.upWins);
        
        // Start next round
        currentRoundId++;
        _startRound();
    }
    
    /**
     * @dev Claim rewards for a resolved round
     * @param roundId The round ID to claim rewards for
     */
    function claimRewards(uint256 roundId) external nonReentrant {
        Round storage round = rounds[roundId];
        require(round.resolved, "Round not resolved");
        
        Prediction storage prediction = predictions[roundId][msg.sender];
        require(prediction.amount > 0, "No prediction found");
        require(!prediction.claimed, "Already claimed");
        require(prediction.isUp == round.upWins, "Prediction incorrect");
        
        prediction.claimed = true;
        
        // Calculate rewards
        uint256 winningPool = round.upWins ? round.upAmount : round.downAmount;
        uint256 losingPool = round.upWins ? round.downAmount : round.upAmount;
        
        if (winningPool > 0 && losingPool > 0) {
            // Calculate user's share of the winning pool
            uint256 userShare = (prediction.amount * BASIS_POINTS) / winningPool;
            
            // Calculate rewards from losing pool (minus treasury fee)
            uint256 treasuryAmount = (losingPool * treasuryFee) / BASIS_POINTS;
            uint256 rewardPool = losingPool - treasuryAmount;
            uint256 userReward = (rewardPool * userShare) / BASIS_POINTS;
            
            // Total payout = original bet + reward
            uint256 totalPayout = prediction.amount + userReward;
            
            // Update user stats
            userStats[msg.sender].correctPredictions++;
            userStats[msg.sender].currentStreak++;
            userStats[msg.sender].totalWinnings += userReward;
            
            if (userStats[msg.sender].currentStreak > userStats[msg.sender].bestStreak) {
                userStats[msg.sender].bestStreak = userStats[msg.sender].currentStreak;
            }
            
            // Transfer rewards
            payable(msg.sender).transfer(totalPayout);
            
            emit RewardsClaimed(msg.sender, roundId, totalPayout);
        } else {
            // If no losing pool, just return the bet
            payable(msg.sender).transfer(prediction.amount);
            emit RewardsClaimed(msg.sender, roundId, prediction.amount);
        }
    }
    
    /**
     * @dev Handle incorrect predictions (reset streak)
     * @param user The user address
     * @param roundId The round ID
     */
    function handleIncorrectPrediction(address user, uint256 roundId) external {
        require(msg.sender == address(this), "Internal function");
        
        Round storage round = rounds[roundId];
        Prediction storage prediction = predictions[roundId][user];
        
        if (prediction.amount > 0 && round.resolved && prediction.isUp != round.upWins) {
            userStats[user].currentStreak = 0;
        }
    }
    
    /**
     * @dev Get user's prediction for a round
     */
    function getUserPrediction(uint256 roundId, address user) 
        external 
        view 
        returns (uint256 amount, bool isUp, bool claimed) 
    {
        Prediction memory prediction = predictions[roundId][user];
        return (prediction.amount, prediction.isUp, prediction.claimed);
    }
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) 
        external 
        view 
        returns (
            uint256 totalPredictions,
            uint256 correctPredictions,
            uint256 currentStreak,
            uint256 bestStreak,
            uint256 totalWinnings,
            uint256 totalStaked
        ) 
    {
        UserStats memory stats = userStats[user];
        return (
            stats.totalPredictions,
            stats.correctPredictions,
            stats.currentStreak,
            stats.bestStreak,
            stats.totalWinnings,
            stats.totalStaked
        );
    }
    
    /**
     * @dev Get current round info
     */
    function getCurrentRound() 
        external 
        view 
        returns (
            uint256 roundId,
            uint256 startTime,
            uint256 endTime,
            uint256 lockTime,
            uint256 upAmount,
            uint256 downAmount,
            uint256 totalAmount
        ) 
    {
        Round memory round = rounds[currentRoundId];
        return (
            round.roundId,
            round.startTime,
            round.endTime,
            round.lockTime,
            round.upAmount,
            round.downAmount,
            round.totalAmount
        );
    }
    
    /**
     * @dev Calculate user's accuracy percentage
     */
    function getUserAccuracy(address user) external view returns (uint256) {
        UserStats memory stats = userStats[user];
        if (stats.totalPredictions == 0) return 0;
        return (stats.correctPredictions * 10000) / stats.totalPredictions; // Returns basis points
    }
    
    /**
     * @dev Start a new round
     */
    function _startRound() internal {
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + roundDuration;
        uint256 lockTime = endTime - lockDuration;
        
        rounds[currentRoundId] = Round({
            roundId: currentRoundId,
            startTime: startTime,
            endTime: endTime,
            lockTime: lockTime,
            startPrice: 0, // Will be set by oracle
            endPrice: 0,
            upAmount: 0,
            downAmount: 0,
            totalAmount: 0,
            resolved: false,
            upWins: false
        });
        
        emit RoundStarted(currentRoundId, startTime, endTime);
    }
    
    /**
     * @dev Set the starting price for the current round
     */
    function setStartPrice(uint256 price) external {
        require(msg.sender == priceOracle || msg.sender == owner(), "Not authorized");
        rounds[currentRoundId].startPrice = price;
    }
    
    /**
     * @dev Admin functions
     */
    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = _priceOracle;
        emit PriceOracleUpdated(_priceOracle);
    }
    
    function setTreasuryFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high"); // Max 10%
        treasuryFee = _fee;
    }
    
    function setMinimumBet(uint256 _minimumBet) external onlyOwner {
        minimumBet = _minimumBet;
    }
    
    function setRoundDuration(uint256 _duration) external onlyOwner {
        require(_duration >= 1 hours, "Duration too short");
        roundDuration = _duration;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Withdraw treasury fees
     */
    function withdrawTreasuryFees() external {
        require(msg.sender == treasury || msg.sender == owner(), "Not authorized");
        // Implementation would track and withdraw accumulated fees
    }
}
