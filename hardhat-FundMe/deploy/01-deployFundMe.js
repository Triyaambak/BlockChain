//Importing the networkConfig JSON file to extract details of the network
const {
    networkConfig,
    devChains,
} = require("../helper-hardhat-network-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");
require("dotenv").config();

//The 2 params getNamedAccounts and deployments are being extracted from HRE - hardhat runtime environment
//HRE is an object which contains all the functions and global variables present in hardhat

module.exports = async ({ getNamedAccounts, deployments }) => {
    //Extracting the deploy and log functions from deployments with which we can deploy our contract
    const { deploy, log } = deployments;

    //This is being extract from the hardh.config.js - namedAccounts
    const { deployer } = await getNamedAccounts();

    //This line is used to extract the chainId of the current network it is being deployed to
    const chainId = network.config.chainId;
    const chainName = network.name;

    //Extracting the Data Feed address from networkConfig
    let ethUsdPriceFeedAddress;
    if (devChains.includes(chainName)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    //Deploying our contract
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    //Verifying our contract and deploying to a chain
    //Do not verify and deploy the contract on a local chain
    if (!devChains.includes(chainName) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress]);
    }

    log("-----------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
