const { run } = require("hardhat");

const verify = async (contractAddress, args) => {
    console.log(`Verifying contract ${contractAddress}...`);
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
        else console.log(`Error in verifying ${error}`);
    }
};

module.exports = { verify };
