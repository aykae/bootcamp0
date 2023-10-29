import './HomePage.css'
import NFTCard from './NFTCard';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { AUCTION_ADDRESS, AUCTION_ABI} from './utils';

interface IAuctionInfo {
	nftContract: string;
	nftId: number;
	auctionLength: number;
	endTime: number;
	minBid: number;
	bids: Object;
	bidders: Object;
	seller: string;
	winner: string;
}

function HomePage() {

	const navigate = useNavigate();
	const [auctions, setAuctions] = useState<IAuctionInfo[]>([]);

	const fetchAuctions = async () => {
		const provider = new ethers.BrowserProvider(window.ethereum);
		const signer = await provider.getSigner();

		const auctionContract = new ethers.Contract(
			AUCTION_ADDRESS,
			AUCTION_ABI,
			signer
		)

		const maxAuctionId = await auctionContract.maxAuctionId();

		const contractAuctions = [];
		for (let i = 1; i <= maxAuctionId; i++) {
			const auctionInfo = await auctionContract.auctionInfos(i);
			contractAuctions.push(auctionInfo);
		}

		setAuctions(contractAuctions);
	}

	useEffect(() => {
		if (!window.ethereum.isConnected()) {
			navigate('/connect-wallet')
		}

		fetchAuctions();
	}, []);

	function handleAuctionClick() {
		navigate(`/start-auction`);
	}

return (
	<div>
    	<div className='topbar horizontal-box'>
        	<h1 className='title-text'>Auction Site</h1>
        	<button className='box vertical-margin' onClick={handleAuctionClick}>
            	New Auction
        	</button>
    	</div>
    	<div className='cards-container'>
        	{
            	auctions.map((auction, i) => (
                	<NFTCard contractAddress={auction.nftContract} id={i} />))
        	}
    	</div>
	</div>
)
}

export default HomePage;
