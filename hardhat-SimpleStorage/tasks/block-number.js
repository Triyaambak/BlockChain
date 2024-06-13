const { task } = require("hardhat/config");

task("block-number", "Gives the current block number").setAction(
    async (taskArgs, hre) => {
        const blockNumber = await hre.ethers.provider.getBlockNumber();
        console.log(`Block Number is ${blockNumber}`);
    }
);

//Exporting all the task functions
module.exports = {};
