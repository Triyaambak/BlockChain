//This is a helper file which is used to store all the details of a network
//ChainId : { Network_Name , Data_Feed_Address }

const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694aa1769357215de4fac081bf1f309adc325306",
    },
};

//These are the chains on our local network
const devChains = ["hardhat", "localhost"];

//Defines how many decimal places our local chain currency should contain
const DECIMALS = 8;

//Defines the starting price of our local chain currency
const INITIAL_ANSWER = 200000000;

module.exports = {
    networkConfig,
    devChains,
    DECIMALS,
    INITIAL_ANSWER,
};
