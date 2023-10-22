import NFTCard from './NFTCard';
import './NFTPage.css'

function NFTPage() {
    return (
        <>
        <div className="page">
            <div className="box horizontal-box">
                <div className="">
                <img src='https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2021%2F10%2Fbored-ape-yacht-club-nft-3-4-million-record-sothebys-metaverse-0.jpg?w=960&cbr=1&q=90&fit=max' className='image' />
                    <div className='box'>
                        <h3>BAYC #0001</h3>
                    </div>
                </div>
                <div>
                    <div>
                        <h3>Current Owner: 0x...</h3>
                        <h3>Minimum Bid: 1 ETH</h3>
                        <h3>Highest Bid: 1 ETH</h3>
                        <h3>Time Remaining: 1d12h30m0s</h3>
                    </div>
                    <div className="card">
                        <div className="box-content">
                        <h3 style={{textAlign: "right"}}>2 ETH</h3>
                        <h3 style={{textAlign: "center"}}>Submit New Bid</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default NFTPage;