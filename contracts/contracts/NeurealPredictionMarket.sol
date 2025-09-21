// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title NeurealPredictionMarket
 * @dev Prediction market contract for NEURAL token price predictions
 */
contract NeurealPredictionMarket is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable neuralToken;
    
    // Constants
    uint256 public constant ROUND_DURATION = 24 hours;
    uint256 public constant LOCK_DURATION = 24 hours;
    uint256 public constant MIN_PREDICTION_AMOUNT = 1 * 10**18; // 1 NEURAL
    uint256 public constant MAX_PREDICTION_AMOUNT = 100_000 * 10**18; // 100k NEURAL
    uint256 public constant PLATFORM_FEE_RATE = 100; // 1% (100 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Enums
    enum Position { UP, DOWN }
    enum RoundState { ACTIVE, LOCKED, RESOLVED, CANCELLED }
    
    // Structs
    struct Round {
        uint256 roundId;
        uint256 startTime;
        uint256 lockTime;
        uint256 endTime;
        uint256 startPrice;
        uint256 lockPrice;
        uint256 endPrice;
        uint256 totalUpAmount;
        uint256 totalDownAmount;
        uint256 rewardBaseCalAmount;
        uint256 rewardAmount;
        RoundState state;
        bool resolved;
    }
    
    struct Prediction {
        Position position;
        uint256 amount;
        bool claimed;
        uint256 claimableAmount;
    }
    
    struct UserStats {
        uint256 totalStaked;
        uint256 totalWinnings;
        uint256 currentWinStreak;
        uint256 maxWinStreak;
        uint256 totalRounds;
        uint256 wonRounds;
    }
    
    // State variables
    uint256 public currentRoundId;
    uint256 public treasuryAmount;
    address public treasuryAddress;
    address public oracleAddress;
    
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => Prediction)) public predictions;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256[]) public userRounds;
    
    // Events
    event RoundStarted(uint256 indexed roundId, uint256 startTime, uint256 lockTime, uint256 endTime);
    event RoundLocked(uint256 indexed roundId, uint256 lockPrice);
    event RoundResolved(uint256 indexed roundId, uint256 endPrice, Position winningPosition);
    event PredictionMade(address indexed user, uint256 indexed roundId, Position position, uint256 amount);
    event RewardClaimed(address indexed user, uint256 indexed roundId, uint256 amount);
    event TreasuryWithdraw(uint256 amount);
    event OracleUpdated(address indexed newOracle);
    event TreasuryAddressUpdated(address indexed newTreasury);
    
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call this function");
        _;
    }
    
    modifier validRound(uint256 roundId) {
        require(rounds[roundId].startTime != 0, "Round does not exist");
        _;
    }
    
    constructor(
        address _neuralToken,
        address _treasuryAddress,
        address _oracleAddress,
        address _owner
    ) Ownable(_owner) {
        require(_neuralToken != address(0), "Invalid token address");
        require(_treasuryAddress != address(0), "Invalid treasury address");
        require(_oracleAddress != address(0), "Invalid oracle address");
        
        neuralToken = IERC20(_neuralToken);
        treasuryAddress = _treasuryAddress;
        oracleAddress = _oracleAddress;
    }
    
    /**
     * @dev Start a new prediction round
     * @param startPrice Initial price for the round
     */
    function startRound(uint256 startPrice) external onlyOracle whenNotPaused {
        require(startPrice > 0, "Invalid start price");
        
        // Resolve previous round if exists
        if (currentRoundId > 0) {
            require(rounds[currentRoundId].state == RoundState.RESOLVED, "Previous round not resolved");
        }
        
        currentRoundId++;
        uint256 startTime = block.timestamp;
        uint256 lockTime = startTime + ROUND_DURATION;
        uint256 endTime = lockTime + LOCK_DURATION;
        
        rounds[currentRoundId] = Round({
            roundId: currentRoundId,
            startTime: startTime,
            lockTime: lockTime,
            endTime: endTime,
            startPrice: startPrice,
            lockPrice: 0,
            endPrice: 0,
            totalUpAmount: 0,
            totalDownAmount: 0,
            rewardBaseCalAmount: 0,
            rewardAmount: 0,
            state: RoundState.ACTIVE,
            resolved: false
        });
        
        emit RoundStarted(currentRoundId, startTime, lockTime, endTime);
    }
    
    /**
     * @dev Lock the current round for predictions
     * @param lockPrice Price at lock time
     */
    function lockRound(uint256 lockPrice) external onlyOracle whenNotPaused {
        require(lockPrice > 0, "Invalid lock price");
        require(currentRoundId > 0, "No active round");
        
        Round storage round = rounds[currentRoundId];
        require(round.state == RoundState.ACTIVE, "Round not active");
        require(block.timestamp >= round.lockTime, "Round not ready to lock");
        
        round.lockPrice = lockPrice;
        round.state = RoundState.LOCKED;
        
        emit RoundLocked(currentRoundId, lockPrice);
    }
    
    /**
     * @dev Resolve the current round
     * @param endPrice Final price for the round
     */
    function resolveRound(uint256 endPrice) external onlyOracle whenNotPaused {
        require(endPrice > 0, "Invalid end price");
        require(currentRoundId > 0, "No active round");
        
        Round storage round = rounds[currentRoundId];
        require(round.state == RoundState.LOCKED, "Round not locked");
        require(block.timestamp >= round.endTime, "Round not ready to resolve");
        
        round.endPrice = endPrice;
        round.state = RoundState.RESOLVED;
        round.resolved = true;
        
        // Determine winning position
        Position winningPosition = endPrice > round.lockPrice ? Position.UP : Position.DOWN;
        
        // Calculate rewards
        uint256 totalAmount = round.totalUpAmount + round.totalDownAmount;
        if (totalAmount > 0) {
            uint256 platformFee = (totalAmount * PLATFORM_FEE_RATE) / BASIS_POINTS;
            treasuryAmount += platformFee;
            
            round.rewardBaseCalAmount = totalAmount - platformFee;
            round.rewardAmount = round.rewardBaseCalAmount;
        }
        
        emit RoundResolved(currentRoundId, endPrice, winningPosition);
    }
    
    /**
     * @dev Make a prediction for the current round
     * @param position UP or DOWN prediction
     * @param amount Amount of NEURAL tokens to stake
     */
    function predict(Position position, uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_PREDICTION_AMOUNT, "Amount below minimum");
        require(amount <= MAX_PREDICTION_AMOUNT, "Amount above maximum");
        require(currentRoundId > 0, "No active round");
        
        Round storage round = rounds[currentRoundId];
        require(round.state == RoundState.ACTIVE, "Round not active for predictions");
        require(block.timestamp < round.lockTime, "Prediction period ended");
        require(predictions[currentRoundId][msg.sender].amount == 0, "Already predicted this round");
        
        // Transfer tokens from user
        neuralToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Record prediction
        predictions[currentRoundId][msg.sender] = Prediction({
            position: position,
            amount: amount,
            claimed: false,
            claimableAmount: 0
        });
        
        // Update round totals
        if (position == Position.UP) {
            round.totalUpAmount += amount;
        } else {
            round.totalDownAmount += amount;
        }
        
        // Update user stats
        userStats[msg.sender].totalStaked += amount;
        userStats[msg.sender].totalRounds++;
        userRounds[msg.sender].push(currentRoundId);
        
        emit PredictionMade(msg.sender, currentRoundId, position, amount);
    }
    
    /**
     * @dev Claim rewards for a resolved round
     * @param roundId Round to claim rewards from
     */
    function claimReward(uint256 roundId) external nonReentrant validRound(roundId) {
        Round storage round = rounds[roundId];
        require(round.resolved, "Round not resolved");
        
        Prediction storage prediction = predictions[roundId][msg.sender];
        require(prediction.amount > 0, "No prediction found");
        require(!prediction.claimed, "Already claimed");
        
        uint256 rewardAmount = 0;
        
        // Check if user won
        Position winningPosition = round.endPrice > round.lockPrice ? Position.UP : Position.DOWN;
        
        if (prediction.position == winningPosition) {
            // Calculate proportional reward
            uint256 winningPool = winningPosition == Position.UP ? round.totalUpAmount : round.totalDownAmount;
            
            if (winningPool > 0) {
                rewardAmount = (prediction.amount * round.rewardAmount) / winningPool;
            }
            
            // Update user stats
            userStats[msg.sender].totalWinnings += rewardAmount;
            userStats[msg.sender].wonRounds++;
            userStats[msg.sender].currentWinStreak++;
            
            if (userStats[msg.sender].currentWinStreak > userStats[msg.sender].maxWinStreak) {
                userStats[msg.sender].maxWinStreak = userStats[msg.sender].currentWinStreak;
            }
        } else {
            // User lost, reset win streak
            userStats[msg.sender].currentWinStreak = 0;
        }
        
        prediction.claimed = true;
        prediction.claimableAmount = rewardAmount;
        
        if (rewardAmount > 0) {
            neuralToken.safeTransfer(msg.sender, rewardAmount);
        }
        
        emit RewardClaimed(msg.sender, roundId, rewardAmount);
    }
    
    /**
     * @dev Get claimable amount for a user in a specific round
     */
    function getClaimableAmount(uint256 roundId, address user) external view returns (uint256) {
        Round memory round = rounds[roundId];
        Prediction memory prediction = predictions[roundId][user];
        
        if (!round.resolved || prediction.amount == 0 || prediction.claimed) {
            return 0;
        }
        
        Position winningPosition = round.endPrice > round.lockPrice ? Position.UP : Position.DOWN;
        
        if (prediction.position == winningPosition) {
            uint256 winningPool = winningPosition == Position.UP ? round.totalUpAmount : round.totalDownAmount;
            
            if (winningPool > 0) {
                return (prediction.amount * round.rewardAmount) / winningPool;
            }
        }
        
        return 0;
    }
    
    /**
     * @dev Get user's prediction rounds
     */
    function getUserRounds(address user) external view returns (uint256[] memory) {
        return userRounds[user];
    }
    
    /**
     * @dev Withdraw treasury funds (only owner)
     */
    function withdrawTreasury(uint256 amount) external onlyOwner {
        require(amount <= treasuryAmount, "Insufficient treasury balance");
        
        treasuryAmount -= amount;
        neuralToken.safeTransfer(treasuryAddress, amount);
        
        emit TreasuryWithdraw(amount);
    }
    
    /**
     * @dev Update oracle address (only owner)
     */
    function setOracle(address _oracleAddress) external onlyOwner {
        require(_oracleAddress != address(0), "Invalid oracle address");
        oracleAddress = _oracleAddress;
        emit OracleUpdated(_oracleAddress);
    }
    
    /**
     * @dev Update treasury address (only owner)
     */
    function setTreasuryAddress(address _treasuryAddress) external onlyOwner {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        treasuryAddress = _treasuryAddress;
        emit TreasuryAddressUpdated(_treasuryAddress);
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only owner, when paused)
     */
    function emergencyWithdraw() external onlyOwner whenPaused {
        uint256 balance = neuralToken.balanceOf(address(this));
        neuralToken.safeTransfer(owner(), balance);
    }
}
