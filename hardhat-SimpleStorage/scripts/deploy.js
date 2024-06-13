const { ethers, run } = require("hardhat");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const main = async () => {
    //Declaring the factory with which contracts are gonna be deployed
    const SimpleStorageFactory =
        await ethers.getContractFactory("SimpleStorage");

    console.log("Deploying contract ...");
    //Deploying the contract using the factory
    const simpleStorage = await SimpleStorageFactory.deploy();

    //Waiting for the contract to be deployed
    await simpleStorage.waitForDeployment();

    //Console logging the address of the transaction containing the contract
    console.log(`Deployed contract to ${simpleStorage.target}`);

    //Verifying the contract automatically
    //Do not verify if contract is deployed on Hardhat as it runs locally
    //Do not verify if Etherscan API KEY does not exist
    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        //Should wait for the block to be mined and 6 transaction confirmation to be appended
        //Safer this way
        console.log("Waiting for tx confirmations");
        await simpleStorage.deploymentTransaction().wait(6);
        await verify(simpleStorage.target, []);
    }

    //Retrieving the favNumber from SimpleStorage.sol
    const currentValue = await simpleStorage.retrieve();
    console.log(`Current value is ${currentValue}`);

    //Updating the favNumber
    const txRes = await simpleStorage.store("69");
    await txRes.wait(1);
    const updateValue = await simpleStorage.retrieve();
    console.log(`Updated value is ${updateValue}`);
};

const verify = async (contractAddress, args) => {
    console.log("Verifying contract...");
    try {
        //run is used to execute all hardhat commands without the terminal
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
        console.log("Contract verified");
    } catch (error) {
        //if contract is already verified then handle it seperately
        //else console log the error message
        if (error.message.toLowerCase().includes("has already been verified"))
            console.log("Contract already verified");
        else console.log(`Error in verifyign ${error}`);
    }
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(`Error-${error}`);
        process.exit(1);
    });
