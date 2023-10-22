import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { experimentalAddHardhatNetworkMessageTraceHook } from "hardhat/config";

const { NFT_CONTRACT_ADDRESS, PUBLIC_KEY, NFT_TOKEN_ID, AUCTION_CONTRACT_ADDRESS } = process.env

async function main() {
    const provider = await ethers.provider;

    const pennFT = await ethers.getContractAt("PennFT", NFT_CONTRACT_ADDRESS || "");

    const auction = await ethers.getContractAt("Auction", AUCTION_CONTRACT_ADDRESS || "");

    const [other] = await ethers.getSigners();
    const me = await provider.getSigner(PUBLIC_KEY || '');

    await pennFT.setApprovalForAll(AUCTION_CONTRACT_ADDRESS || '', true);
    await auction.startAuction(NFT_CONTRACT_ADDRESS || '', NFT_TOKEN_ID || '', 1, 5);
    //console.log(await pennFT.ownerOf(0) != PUBLIC_KEY || '');

    const aucId = await auction.maxAuctionId.staticCall();
    //await auction.connect(other).bid(aucId, {value: 10});
    await auction.bid(aucId, {value: 15});

    await auction.endAuction(aucId);
    console.log(await pennFT.ownerOf(0) == PUBLIC_KEY || '');
    console.log(provider.getBalance(PUBLIC_KEY || ''));

    console.log(provider.getBalance(other));
    await auction.connect(other).claim(aucId);
    console.log(provider.getBalance(other));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});