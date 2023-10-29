import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import NFTCard from './NFTCard';
import './StartAuctionPage.css'
import { ethers } from "ethers";
import { AUCTION_ABI, AUCTION_ADDRESS } from "./utils";

interface ICreateAuctionInfo {
    contractAddress: string;
    nftNumber: number;
    minBid: number;
    endTime: number;
}

function StartAuctionPage() {
    const navigate = useNavigate();
    const [createAuctionInfo, setCreateAuctionInfo] = useState<ICreateAuctionInfo>({
        contractAddress: "",
        nftNumber: 0,
        minBid: 0,
        duration: 0,
    })

    useEffect(() => {
        if (!window.ethereum.isConnected()) {
            navigate('/connect-wallet')
        }
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const provider = new ethers.BrowserProvider(window.ethereum);
		const signer = await provider.getSigner();

		// const nftContract = new ethers.Contract (
		// 	NFT_ADDRESS,
		// 	NFT_ABI,
		// 	signer,
		// )

		const auctionContract = new ethers.Contract(
			AUCTION_ADDRESS,
			AUCTION_ABI,
			signer
		)

        await auctionContract.startAuction(
            createAuctionInfo.contractAddress,
            createAuctionInfo.nftNumber,
            createAuctionInfo.endTime,
            createAuctionInfo.minBid,
        );
    }

    return (
        <>
        <div className="container">
            <form onSubmit={handleSubmit}>
                <label htmlFor="contractAddress">Enter Contract Address: </label>
                <input type="text" id="contractAddress" placeholder="0x1234..." value={createAuctionInfo.contractAddress} onChange={(e) => setCreateAuctionInfo({...createAuctionInfo, contractAddress: e.target.value})}/>
                <br/>
                <br/>
                <label htmlFor="nftNumber">NFT Number: </label>
                <input type="number" id="nftNumber" placeholder="0" value={createAuctionInfo.nftNumber} onChange={(e) => setCreateAuctionInfo({...createAuctionInfo, nftNumber: Number(e.target.value)})}/>
                <br/>
                <br/>
                <label htmlFor="minBid">Minimum Bid: </label>
                <input type="number" id="minBid" placeholder="10000" value={createAuctionInfo.minBid} onChange={(e) => setCreateAuctionInfo({...createAuctionInfo, minBid: Number(e.target.value)})}/>
                <br/>
                <br/>
                <label htmlFor="duration">End Time: </label>
                <input type="datetime-local" id="duration" value={createAuctionInfo.duration} onChange={(e) => setCreateAuctionInfo({...createAuctionInfo, duration: Number(e.target.value)})}/>
                <br/>
                <br/>
                <input type="submit" value="Start New Auction"/>
            </form>
        </div>
        </>
    )
}

export default StartAuctionPage;