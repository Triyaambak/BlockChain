//The files in the deploy folder are executed in alphabetical order of their file names
// 00-* will be executed first followed by 01-* and so on
//Hence the mocks will always should be labelled 00 as it should execute and deploy first if it is on a local chain

//The functionality and comments are same as in 01-deployFundMe.js
const {
    devChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-network-config");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainName = network.name;

    //If the network name matches with the devChains defined in the hardhat-network-config
    //Then we deploy it on localhost
    //On localhost , we deploy it with mocks
    if (devChains.includes(chainName)) {
        log("Local network detected!");
        log("Deploying mocks....");
        //Deploying the mocks i.e the mock contract we created
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        log("Mocks deployed");
        log("-------------------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
