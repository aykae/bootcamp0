import { ethers } from "hardhat";

const { NFT_CONTRACT_ADDRESS, PUBLIC_KEY, METADATA_URI } = process.env;

async function main() {
  const pennFT = await ethers.getContractAt("PennFT", NFT_CONTRACT_ADDRESS || '');

  await pennFT.MintNFT(PUBLIC_KEY || '', METADATA_URI || '');    
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
