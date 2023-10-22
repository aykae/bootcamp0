import { useNavigate } from "react-router-dom";

interface NFTCardParams {
	contractAddress: string;
	id: number;    
}

function NFTCard({id} : NFTCardParams) {
	const navigate = useNavigate();

	function handleCardClick() {
    	navigate(`/${id}`);
	}
    
	return (
    	<div className='card' onClick={handleCardClick}>
        	<img src='https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2021%2F10%2Fbored-ape-yacht-club-nft-3-4-million-record-sothebys-metaverse-0.jpg?w=960&cbr=1&q=90&fit=max' className='image' />
        	<div className='box horizontal-box'>
            	<h3>Bored Ape #0001</h3>
            	<h3>1 ETH</h3>
        	</div>
    	</div>
	)
}

export default NFTCard;
