import { ethers } from "hardhat";

const { METADATA_URI } = process.env;

async function main() {
    const [owner, other, another] = await ethers.getSigners();

    // owner mints NFT 
    const pennFT = await ethers.deployContract("PennFT");
    await pennFT.waitForDeployment();
    console.log('PennFT deployed.');

    const nft0 = await pennFT.connect(owner).MintNFT(owner.address, METADATA_URI || '');
    console.log(await pennFT.ownerOf(0) == owner.address);

    const auc = await ethers.deployContract("Auction", [10, 1000]);
    await auc.waitForDeployment();
    console.log('Auction deployed.');

    pennFT.connect(owner).setApprovalForAll(auc.target, true);
    const aucStart = await auc.connect(owner).startAuction(pennFT.target, 0, 100, 10);
    console.log('Owner has placed their NFT up for auction.');

    await auc.connect(other).bid(1, {value: ethers.parseEther("20")});
    console.log('Other has placed a bid.');

    await auc.connect(another).bid(1, {value: ethers.parseEther("50")});
    console.log('Another has placed a higher bid.');

    await auc.connect(another).endAuction(1);
    console.log(await pennFT.ownerOf(0) == another.address);

    await auc.connect(other).claim(1);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})