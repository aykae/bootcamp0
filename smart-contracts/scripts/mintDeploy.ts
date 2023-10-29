import { ethers } from "hardhat";

const { PUBLIC_KEY, IPFS_URI } = process.env;

async function main() {
    const pennFT = await ethers.deployContract("PennFT", []);
    await pennFT.waitForDeployment();

    console.log(
        `PennFT deployed to ${pennFT.target}`
    );

    const [owner, other] = await ethers.getSigners();
    const provider = await ethers.provider
    //const pkSigner = await provider.getSigner(PUBLIC_KEY || '');
    await pennFT.connect(owner).MintNFT(owner, IPFS_URI || '');

    //console.log(await pennFT.numTokens());

    const houseFee = 5;
    const maxAuctionTIme = 60*60*24*7; // 7 days

    const auction =  await ethers.deployContract("Auction", [houseFee, maxAuctionTIme]);

    await auction.waitForDeployment();

    console.log(
        `Auction deployed to ${auction.target}`
    );

    await pennFT.connect(owner).setApprovalForAll(auction.getAddress(), true);
    await auction.connect(owner).startAuction(pennFT.getAddress(), 0, 100*100, 100000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});