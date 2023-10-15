import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseUnits } from "ethers";

const { METADATA_URI } = process.env;

describe("Auction", function() {

    async function deployAuctionFixture() {

        const [owner, other, another] = await ethers.getSigners();

        const Auction = await ethers.getContractFactory("Auction");
        const auc = await Auction.deploy(10, 1000)

        const PennFT = await ethers.getContractFactory("PennFT");
        const pennFT = await PennFT.deploy();

        return { auc, pennFT, owner, other, another };
    }

    describe("Deployment", function () {
        it("Should set valid house fee", async function () {
            const Auction = await ethers.getContractFactory("Auction");
            await expect(Auction.deploy(110, 1000)).to.be.revertedWith(
                "house fee must be less than or equal to 100"
            )
        });

        it("Should set valid max auction length", async function () {
            const Auction = await ethers.getContractFactory("Auction");
            await expect(Auction.deploy(30, 0)).to.be.revertedWith(
                "max auction length must be non-zero"
            )
        });
    });

    describe("Starting Auctions", function () {
        it("Should have non-zero duration", async function () {
            const {auc, pennFT, owner} = await deployAuctionFixture();

            await expect(auc.startAuction(pennFT, 0, 0, 10)).to.be.revertedWith(
                "auction must have a non-zero duration"
            );
        });

        it("Should have duration less than set max", async function () {
            const {auc, pennFT, owner} = await deployAuctionFixture();

            await expect(auc.startAuction(pennFT, 0, 100000, 10)).to.be.revertedWith(
                "auction must have a duration less than or equal to the maximum allowable duration"
            );
        });

        it("Should have non-zero min bid", async function () {
            const {auc, pennFT, owner} = await deployAuctionFixture();

            await expect(auc.startAuction(pennFT, 0, 100, 0)).to.be.revertedWith(
                "auction must have a non-zero minimum bid"
            );
        });

        it("Start of auction must be owner of NFT", async function () {
            const {auc, pennFT, owner, other} = await deployAuctionFixture();

            // Have owner mint an nft and approve auction address
            await pennFT.connect(owner).MintNFT(owner.address, METADATA_URI || '');
            await pennFT.connect(owner).setApprovalForAll(auc.target, true);

            await expect(auc.connect(other).startAuction(pennFT, 0, 100, 10)).to.be.revertedWith(
                "you do not own the nft which you are putting up for auction"
            );

            await expect(auc.connect(owner).startAuction(pennFT, 0, 100, 10)).to.not.be.reverted;
        });
    });

    async function startAuction() {
        const {auc, pennFT, owner, other} = await deployAuctionFixture();

        // Have owner mint an nft and approve auction address
        await pennFT.connect(owner).MintNFT(owner.address, METADATA_URI || '');
        await pennFT.connect(owner).setApprovalForAll(auc.target, true);

        await auc.connect(owner).startAuction(pennFT, 0, 100, 10);
        
        return {auc, pennFT, owner, other};
    }

    describe("Submitting Bids", function () {
        it("Auction must exist", async function () {
            const {auc, pennFT, owner, other} = await startAuction();

            await expect(auc.connect(other).bid(0, {value: 15})).to.be.revertedWith(
                "auction does not exist"
            );

            await expect(auc.connect(other).bid(10, {value: 15})).to.be.revertedWith(
                "auction does not exist"
            );
        });

        it("Bid must be non-zero", async function () {
            const {auc, pennFT, owner, other} = await startAuction();

            await expect(auc.connect(other).bid(1, {value: 0})).to.be.revertedWith(
                "bid must have non-zero value"
            );
        });

        it("Should only bid while the auction is active", async function () {
            const {auc, pennFT, owner, other} = await startAuction();
            
            await time.increase(150);

            await expect(auc.connect(other).bid(1, {value: 15})).to.be.revertedWith(
                "auction must still be ongoing"
            );
        });
    });
})