const { getNamedAccounts, ethers } = require("hardhat");

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding contract");
    const txRes = await fundMe.fund({
        value: ethers.parseEther("0.1"),
    });
    await txRes.wait(1);
    console.log("Contract funded");
};

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
