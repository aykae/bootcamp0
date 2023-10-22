import './HomePage.css'
import NFTCard from './NFTCard';
import { useNavigate } from "react-router-dom";

function HomePage() {

const navigate = useNavigate();

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
            	[...Array(10)].map(() => (
                	<NFTCard contractAddress='' id={1} />))
        	}
    	</div>
	</div>
)
}

export default HomePage;
