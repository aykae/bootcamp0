import {
    time,
    loadFixture,
}   from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { PennCoin__factory } from "../typechain-types";

describe("PennFT", function () {
    async function deployPennFTFixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const pennFTFactory = await ethers.getContractFactory("PennFT");
        const pennFT = await pennFTFactory.deploy();

        return { pennFT, owner, otherAccount };
    }

    describe("MintNFT", function () {
        it("Should assign token with correct URI", async function () {
            const { pennFT, owner } = await loadFixture(deployPennFTFixture);
            
            const uri = "penn_uri";
            await pennFT.MintNFT(owner.address, uri);
            
            const tokenURI = await pennFT.tokenURI(0);
            expect(tokenURI == uri);
        });
    });

    describe("transferFrom", function () {
        it("Should transfer token from sender to receiver", async function () {
            const { pennFT, owner, otherAccount } = await loadFixture(deployPennFTFixture);
            
            await pennFT.MintNFT(owner.address, "penn_uri");

            await pennFT.transferFrom(owner.address, otherAccount.address, 0);
            
            const newOwner = await pennFT.ownerOf(0);

            expect(newOwner == otherAccount.address);
        });
    });
    
    describe("isApprovedForAll & approve", function () {
        it("Should approve address to manage all assets of owner", async function () {
            const { pennFT, owner, otherAccount } = await loadFixture(deployPennFTFixture);
            
            await pennFT.MintNFT(owner.address, "penn_uri");

            await pennFT.approve(otherAccount.address, 0);
            
            const isApproved = await pennFT.isApprovedForAll(owner.address, otherAccount.address);

            expect(isApproved == true);
        });
    });

});