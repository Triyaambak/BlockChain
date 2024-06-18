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
            await expect(fundMe.fund()).to.be.revertedWithCustomError(
                fundMe,
                "FundMe__NotEnoughEth"
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

        //To check the withdrawal and funding from a single account
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

        //To check the withdrawal and funding from multiple accounts
        it("allows us to withdraw with multiple funders", async () => {
            //Get all accounts present in a network
            const accounts = await ethers.getSigners();

            //Funding from multiple accounts
            for (let i = 1; i < 6; i++) {
                //Initally our fundMe is connected to deployer acc , so the contract is being funded by the deployer
                //We can change that , by using fundMe.connect(account)
                //With this the contract will be funded by that account
                const fundMeConnectedAcc = await fundMe.connect(accounts[i]);
                await fundMeConnectedAcc.fund({ value: sendValue });
            }

            //This part is same as with funding from sinlge account
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            );
            const startingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            const txRes = await fundMe.withdraw();
            const txReciept = await txRes.wait(1);

            const { gasUsed, gasPrice } = txReciept;
            const gasCost = gasUsed * gasPrice;

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            );
            const endingDeployerBalance = await ethers.provider.getBalance(
                deployer
            );

            assert.equal(endingFundMeBalance, 0);
            assert.equal(
                (
                    startingFundMeBalance +
                    startingDeployerBalance -
                    gasCost
                ).toString(),
                endingDeployerBalance.toString()
            );

            //We need to make sure funders array is reset properly
            await expect(fundMe.getFunder()).to.be.reverted;

            //Make sure that all accounts have 0 balance in them
            for (let i = 1; i < 6; i++)
                assert.equal(
                    await fundMe.addressToAmountFunded(accounts[i].address),
                    0
                );
        });

        //To check if only the owner is able to withdraw the funds
        it("only allows the owner to deploy", async () => {
            const accounts = await ethers.getSigners();
            //The attacker can be any account other than the deployer
            const attacker = accounts[1];

            //Connecting the contract to the attacker
            const attackConnectedContract = await fundMe.connect(attacker);

            //The withdraw by the attacker should fail from the custom error
            await expect(
                attackConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
    });
});
