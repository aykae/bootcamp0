import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import NFTCard from './NFTCard';
import './StartAuctionPage.css'

function StartAuctionPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!window.ethereum.isConnected()) {
            navigate('/connect-wallet')
        }
    }, []);

    return (
        <>
        <div className="container">
            <h3>Contract Address: 0x...</h3>
            <h3>NFT Number: 1</h3>
            <h3>Minimum Bid: xxx ETH</h3>
            <h3>Length of Auction: 1d 20h</h3>
            <h3 className='btn box vertical-margin'>
                Start New Auction
            </h3>
        </div>
        </>
    )
}

export default StartAuctionPage;