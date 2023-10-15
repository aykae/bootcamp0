pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Auction {
	// todo: add state variables as necessary
    // AKR:

    uint public houseFee;

    address payable public owner;

    /* Auction Variables */

    uint public maxAuctionLength;

    uint public maxAuctionId;

    struct AuctionInfo {
        uint auctionLength;

        // minimum bid amount for auction
        uint minBid;

        // current maximum bid in the auction
        uint maxBid;

        uint endTime;

        address nftContract;

        uint nftId;

        mapping (address => uint) bids;

        address[] bidders;

        address payable seller;

        address payable winner;
    }

    mapping(uint => AuctionInfo) public auctionInfos;

    //event StartAuction(uint)
    event StartAuction(uint auctionId, uint auctionLength, uint minBid, uint endTime);

	constructor(uint _houseFee, uint _maxAuctionLength) {
		// todo: finish this
        // AKR:
        require(_houseFee <= 100, "house fee must be less than or equal to 100");
        require(_maxAuctionLength > 0, "max auction length must be non-zero");

        owner = payable(msg.sender);
        houseFee = _houseFee;
        maxAuctionLength = _maxAuctionLength;
	}

	// gets the amount a person has bid on an auction
	function getBid(uint _auctionId, address _bidder) public view returns (uint) {
		// todo: finish this
        // AKR:
        require(_auctionId > 0, "auction does not exist");
        require(_auctionId <= maxAuctionId, "auction does not exist");
        require(auctionInfos[_auctionId].bids[_bidder] != 0, "bidder does not exist");

        return auctionInfos[_auctionId].bids[_bidder];
	}

	// gets the current highest bid on an auction
	function getHighestBid(uint _auctionId) public view returns (uint) {
		// todo: finish this
        // AKR:
        require(_auctionId > 0, "auction does not exist");
        require(_auctionId <= maxAuctionId, "auction does not exist");

        return auctionInfos[_auctionId].maxBid;
    }

	// startAuction starts an auction for a given NFT
	// it should verify the NFT is owned by the caller
	function startAuction(address _nftContract, uint _nftId, uint _auctionLength, uint _minBid) public returns (uint) {
	
		// note: this connects this contract to the NFT contract
		// this allows us to call methods on the NFT contract
        IERC721 nftContractInstance = IERC721(_nftContract);
    	
		// todo: finish this
        // AKR:
        require(_auctionLength > 0, "auction must have a non-zero duration");
        if (maxAuctionLength > 0) {
            require(_auctionLength <= maxAuctionLength, "auction must have a duration less than or equal to the maximum allowable duration");
        }
        require(_minBid > 0, "auction must have a non-zero minimum bid");
        require(nftContractInstance.ownerOf(_nftId) == msg.sender, "you do not own the nft which you are putting up for auction");
        
        maxAuctionId++;
        auctionInfos[maxAuctionId].auctionLength = _auctionLength;
        auctionInfos[maxAuctionId].minBid = _minBid;
        auctionInfos[maxAuctionId].endTime = block.timestamp + _auctionLength;
        auctionInfos[maxAuctionId].nftContract = _nftContract;
        auctionInfos[maxAuctionId].nftId = _nftId;
        auctionInfos[maxAuctionId].seller = payable(msg.sender);

        // transfer nft to contract owner (so that e.g., seller can't transfer NFT during auction)
        nftContractInstance.safeTransferFrom(auctionInfos[maxAuctionId].seller, owner, auctionInfos[maxAuctionId].nftId);

        //TODO: emit
        emit StartAuction(maxAuctionId, _auctionLength, _minBid, auctionInfos[maxAuctionId].endTime);

        return maxAuctionId;
	}
    
	// bid submits a bid for a given auction
	// this should only allow a bid to be submitted if it’s higher than the minimum bid
	function bid(uint _auctionId) public payable returns (uint) {
		// todo: finish this
        // AKR:
        require(_auctionId > 0, "auction does not exist");
        require(_auctionId <= maxAuctionId, "auction does not exist");
        require(msg.value > 0, "bid must have non-zero value");
        require(block.timestamp < auctionInfos[_auctionId].endTime, "auction must still be ongoing");

        uint currentBid = auctionInfos[_auctionId].bids[msg.sender];
        uint newBid = currentBid + msg.value;

        require(newBid >= auctionInfos[_auctionId].minBid, "bid is below minimum bid for this auction");

        if (currentBid == 0) {
            auctionInfos[_auctionId].bidders.push(msg.sender);
        }

        auctionInfos[_auctionId].bids[msg.sender] += msg.value;

        if (newBid > auctionInfos[_auctionId].maxBid) {
            auctionInfos[_auctionId].maxBid = newBid;
            auctionInfos[_auctionId].winner = payable(msg.sender);
        }

        // TODO: emit Bid

        return auctionInfos[_auctionId].bids[msg.sender];
    }
    
	// claim allows a user to claim their money back if they are not the winner of an auction
	function claim(uint _auctionId) public returns (uint) {
        // todo: finish this
        // AKR:
        require(_auctionId > 0, "auction does not exist");
        require(_auctionId <= maxAuctionId, "auction does not exist");
        require(auctionInfos[_auctionId].endTime <= block.timestamp, "auction must be over to claim bid");

        uint bidAmt = auctionInfos[_auctionId].bids[msg.sender];
        require(msg.sender != auctionInfos[_auctionId].winner, "you are the winner, please end the auction to receive your NFT");
        require(bidAmt > 0, "bid has already been claimed or never existed");

        payable(msg.sender).transfer(bidAmt);

        // mark that bid has been claimed
        auctionInfos[_auctionId].bids[msg.sender] = 0;

        return bidAmt;
	}

	// endAuction ends an auction and pays out the winner
	function endAuction(uint _auctionId) public returns (uint) {
        // todo: finish this
		// note: you will have to connect to the NFT contract again
        // AKR:
        require(_auctionId > 0, "auction does not exist");
        require(_auctionId <= maxAuctionId, "auction does not exist");
        require(auctionInfos[_auctionId].endTime <= block.timestamp, "auction must be over to claim NFT");
        address winner = auctionInfos[_auctionId].winner;
        require(winner == msg.sender, "only the winner of the auction can end it");

        IERC721 nftContractInstance = IERC721(auctionInfos[_auctionId].nftContract);
        require(nftContractInstance.ownerOf(auctionInfos[_auctionId].nftId) == owner, "auction already ended");

        uint fee = (houseFee * auctionInfos[_auctionId].bids[winner]) / 100;
        uint payout = auctionInfos[_auctionId].bids[winner] - fee;

        auctionInfos[_auctionId].seller.transfer(payout);
        owner.transfer(fee);

        // transfer NFT from seller to winner
        nftContractInstance.safeTransferFrom(owner, auctionInfos[_auctionId].winner, auctionInfos[_auctionId].nftId);

        return payout;
	}    	
}
