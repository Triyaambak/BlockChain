const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { assert, expect } = require("chai");

//This testing is for the entire FundMe contract
describe("FundMe", async () => {
    let fundMe;
    let MockV3Aggregator;
    let deployer;
    const sendValue = ethers.parseEther("1"); //1 eth
    console.log(sendValue);

    //We need to deploy our FundMe contract before each test
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        //fixture is used to run all our deploy scripts with many tags
        //All deploy scripts with tags "all" will be run locally
        await deployments.fixture(["all"]);

        //If ethers.getContract is throwing an error saying its undefined then
        //In hardhat.config.js
        //require("@nomicslabs/hardhat-ethers")

        fundMe = await ethers.getContract("FundMe", deployer);
        MockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        );
    });

    //This test is for the constructor
    describe("constructor", async () => {
        it("sets the AggregatorV3Interface correctly", async () => {
            const res = await fundMe.getPriceFeed();
            //Use MockV3Aggregator.target instead of .address as newer versions support target
            assert.equal(res, MockV3Aggregator.target);
        });
    });

    //This test is for the fund function
    describe("fund", async () => {
        //This test is to check if the require min eth is working
        it("fails if you do not have min Eth", async () => {
            //.to.be.reverted specifies that this test is likely to fail and hence our tx should not terminate
            await expect(fundMe.fund()).to.be.revertedWith(
                "Not Enough Ethereum"
            );
        });
        //This test is to check if the map data structure is getting updated
        it("updates the amount funded data strucute", async () => {
            await fundMe.fund({ value: sendValue });
            const response = await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });
        //This is to check if the funders array is getting updated
        it("updates the funders data structure", async () => {
            await fundMe.fund({ value: sendValue });
            //Retrieving the last index in the array i.e the most recently updated funder
            const response = await fundMe.getFunder();
            assert.equal(response, deployer);
        });
    });

    describe("withdraw", async () => {
        //Before we withdraw and test the functionalities of withdraw
        //We need to fund the contract with some eth before each test case
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH from a single funder", async () => {
            //contract.provider.getBalance is used to get the ETH amount stored in that contract wrt to address
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            );
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            //Calling the withdraw functiona and waiting for 1 block confirmation
            const txRes = await fundMe.withdraw();
            const txReciept = await txRes.wait(1);

            //We need to calculate amount of gas used
            //Formula : gasCost = gasUsed * cost of 1 gas
            const { gasUsed, gasPrice } = txReciept;
            const gasCost = gasUsed * gasPrice;

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            );
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            //After withdrawing , FundMe contract should have 0 balance
            //The deployer should have the startingFund + startingDeployer - gasCost
            assert.equal(endingFundMeBalance, 0);
            assert.equal(
                (
                    startingFundMeBalance +
                    startingDeployerBalance -
                    gasCost
                ).toString(),
                endingDeployerBalance.toString()
            );
        });
    });
});
