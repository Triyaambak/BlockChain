const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { devChains } = require("../../helper-hardhat-network-config");
const { assert } = require("chai");

//Same as FundMe-test.js
//Instead of testing on local chain , we are testing on a testnet

//Only run this if it is on a testnet
devChains.includes(network)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe;
          let deployer;
          const sendValue = ethers.parseEther("0.1"); //0.1 eth

          beforeEach(async () => {
              deployer = await getNamedAccounts().deployer;

              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw;
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.target
              );
              assert.equal(endingBalance.toString(), "0");
          });
      });
