// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract LuckyChance {
    /* Payout Variables */

    // the amount of profit from each game taken by the house (as a percent)
    // i.e. houseFee = 5 means house takes 5% of each game
    uint public houseFee;

    // address of the owner of the smart contract
    // we will check this when paying out the tokens
    address payable public owner;
    
    /* Game Variables */
    
    // holds the maximum duration a game can have
    // if this is set to 0, games can have any duration
    uint public maxGameLength;

    // holds the latest game id (for validation)
    // we will track each game by a unique id, starting at 1 (so we don't accidentally enter an invalid game)
    uint public maxGameId;

    // contains information about the current state of a single game game
    struct GameInfo {
        // length of the game in seconds
        uint gameLength;

        // maximum allowable bet (in wei)
        uint maxBet;

        // end time of the game
        uint endTime;
        
        // total number of tokens wagered
        uint totalPot;

        // keeps track of the amount each user has bet
        mapping (address => uint) bets;

        // keeps track of the addresses that have bet
        address[] bettors;

        // tracks the winner of the game
        address payable winner;
    }
    
    // will keep track of the info for each game
    mapping(uint => GameInfo) public gameInfos;

    // emmitted when a user starts a game
    event StartGame(uint gameId, uint gameLength, uint maxBet, uint endTime);

    // emitted when a user submits a bet
    event Bet(address bidder, uint amount);
    
    // emitted when a game ends
    event EndGame(uint gameId, uint totalPot, address winner);

    // random number seed to set rng generator
    uint private seed;

    // initialize the contract
    constructor(uint _houseFee, uint _maxGameLength, uint _seed) {
        require(_houseFee <= 100, "house fee must be less than or equal to 100");

        // the deployer owns the contract
        owner = payable(msg.sender);
        houseFee = _houseFee;
        maxGameLength = _maxGameLength;
        seed = _seed;
    }

    /* View Functions */
    // getNumBettors gets the number of different bettors that bet in a given game
    function getNumBettors(uint _gameId) public view returns (uint) {
        require(_gameId > 0, "game does not exist");
        require(_gameId <= maxGameId, "game does not exist");

        return gameInfos[_gameId].bettors.length;
    }

    // getBettorAtIndex gets the address of the bettor at a given index of a given game
    function getBettorAtIndex(uint _gameId, uint _index) public view returns (address) {
        require(_gameId > 0, "game does not exist");
        require(_gameId <= maxGameId, "game does not exist");
        require(_index < gameInfos[_gameId].bettors.length, "index out of bounds");

        return gameInfos[_gameId].bettors[_index];
    }
    
    // getBettorBetAmount gets the amount a given address has bet on a given game
    function getBettorBetAmount(uint _gameId, address _bettor) public view returns (uint) {
        require(_gameId > 0, "game does not exist");
        require(_gameId <= maxGameId, "game does not exist");

        return gameInfos[_gameId].bets[_bettor];
    }
    
    /* Action Functions */

    // startGame starts a new game
    function startGame(uint _gameLength, uint _maxBet) public returns (uint) {
        require(_gameLength > 0, "game must have a non-zero duration");
        if (maxGameLength > 0) {
            require(_gameLength <= maxGameLength, "game must have a duration less than or equal to the maximum allowable duration");
        }
        require(_maxBet > 0, "game must have a non-zero maximum bet");

        maxGameId++;
        gameInfos[maxGameId].gameLength = _gameLength;
        gameInfos[maxGameId].maxBet = _maxBet;
        gameInfos[maxGameId].endTime = block.timestamp + _gameLength;
        gameInfos[maxGameId].totalPot = 0;
        
        emit StartGame(maxGameId, _gameLength, _maxBet, gameInfos[maxGameId].endTime);

        return maxGameId;
    }
    
    // submitBid allows a user to submit a bet to a game
    function submitBet(uint _gameId) public payable returns (uint) {
        require(_gameId > 0, "game does not exist");
        require(_gameId <= maxGameId, "game does not exist");
        require(msg.value > 0, "bet must have a non-zero value");
        require(block.timestamp < gameInfos[_gameId].endTime, "game must still be ongoing");
        
        uint currentBid = gameInfos[_gameId].bets[msg.sender];
        uint newBid = currentBid + msg.value;

        require(newBid <= gameInfos[_gameId].maxBet, "total bet must not be larger than the maximum allowable bet");

        if (currentBid == 0) {
            // if this is their first bet, we need to add them to the list of bettors
            gameInfos[_gameId].bettors.push(msg.sender);
        }
            
        gameInfos[_gameId].bets[msg.sender] += msg.value;
        gameInfos[_gameId].totalPot += msg.value;
        
        emit Bet(msg.sender, msg.value);

        return gameInfos[_gameId].bets[msg.sender];
    }

    // chooseWinner selects a random winner from the bettors based on the bets
    function chooseWinner(uint _gameId) internal view returns (address payable) {
        uint randomHash = uint(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, seed, gameInfos[_gameId].bettors)));
        uint randomNumber = randomHash % gameInfos[_gameId].totalPot;
            
        uint temp = 0;
        for (uint i = 0; i < gameInfos[_gameId].bettors.length; i++) {
            temp += gameInfos[_gameId].bets[gameInfos[_gameId].bettors[i]];
            if (randomNumber <= temp) {
                return payable(gameInfos[_gameId].bettors[i]);
            }
        }
        
        // this should never happen
        revert("no winner found");
    }

    // endGame ends the game
    // even if no participant calls the game, the owner of the contract has incentive to call the game to claim the fee
    function endGame(uint _gameId) public returns (address, uint) {
        require(_gameId > 0, "game does not exist");
        require(_gameId <= maxGameId, "game does not exist");
        require(gameInfos[_gameId].endTime >= block.timestamp, "game must be over");
        require(gameInfos[_gameId].totalPot > 0, "at least one bet must have been submitted");

        gameInfos[_gameId].winner = chooseWinner(_gameId);
        
        uint fee = (houseFee * gameInfos[_gameId].totalPot) / 100;
        uint savedPot = gameInfos[_gameId].totalPot;
        uint winnings = savedPot - fee;

        gameInfos[_gameId].winner.transfer(winnings);
        owner.transfer(fee);
        
        emit EndGame(_gameId, savedPot, gameInfos[_gameId].winner);
        
        return (gameInfos[_gameId].winner, winnings);
    }
}
