import {
    time,
    loadFixture,
}   from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { PennCoin__factory } from "../typechain-types";

describe("PennCoin", function () {
    async function deployPennCoinFixture() {
        const initialSupply = 1_000_000;

        const [owner, otherAccount] = await ethers.getSigners();

        const pennCoinFactory = await ethers.getContractFactory("PennCoin");
        const pennCoin = await pennCoinFactory.deploy(initialSupply);

        return { pennCoin, initialSupply, owner, otherAccount };
    }

    describe("Deployment", function () {
        it("Should set the right initial supply", async function () {
            const { pennCoin, initialSupply } = await loadFixture(deployPennCoinFixture);

            expect(await pennCoin.totalSupply()).to.equal(initialSupply);
        });

        it("Should set the right owner", async function () {
            const { pennCoin, owner, initialSupply } = await loadFixture(deployPennCoinFixture);

            expect(await pennCoin.balanceOf(owner.address)).to.equal(initialSupply);
        });
    });
    describe("Transfers", function() {
        describe("transfer", function() {
            it("Should transfer the funds from the sender to the receiver", async function () {
                console.log("TEST LOG");
                const {pennCoin, owner, otherAccount} = await loadFixture(deployPennCoinFixture);
                //const pcnTotalSupply = await pennCoin.totalSupply();

                const amount = BigInt(100);
                
                const ownerBalanceBefore = await pennCoin.balanceOf(owner.address);
                const otherBalanceBefore = await pennCoin.balanceOf(otherAccount.address);

                await pennCoin.connect(owner).transfer(otherAccount.address, amount);

                const ownerBalanceAfter = await pennCoin.balanceOf(owner.address);
                const otherBalanceAfter = await pennCoin.balanceOf(otherAccount.address);
                
                expect((ownerBalanceBefore-ownerBalanceAfter) == amount);
                expect((otherBalanceAfter-otherBalanceBefore) == amount);
            });
        });

        describe("approve & transferFrom", function() {
            it("Should approve the specified amount of tokens and change spender's allowance", async function () {
                const {pennCoin, owner, otherAccount} = await loadFixture(deployPennCoinFixture);
                const amount = BigInt(100);

                const otherAllowanceBefore = await pennCoin.allowance(owner.address, otherAccount.address);

                await pennCoin.approve(otherAccount, amount);

                const otherAllowanceAfter = await pennCoin.allowance(owner.address, otherAccount.address);

                expect((otherAllowanceAfter-otherAllowanceBefore) == amount);
            });

            it("Should transfer the funds from the sender to the receiver", async function () {
                const {pennCoin, owner, otherAccount} = await loadFixture(deployPennCoinFixture);

                const amount = BigInt(100);
                await pennCoin.approve(owner, amount);
                
                const ownerBalanceBefore = await pennCoin.balanceOf(owner.address);
                const otherBalanceBefore = await pennCoin.balanceOf(otherAccount.address);

                await pennCoin.transferFrom(owner.address, otherAccount.address, amount);

                const ownerBalanceAfter = await pennCoin.balanceOf(owner.address);
                const otherBalanceAfter = await pennCoin.balanceOf(otherAccount.address);
                
                expect((ownerBalanceBefore-ownerBalanceAfter) == amount);
                expect((otherBalanceAfter-otherBalanceBefore) == amount);
            });
        });
    });
});