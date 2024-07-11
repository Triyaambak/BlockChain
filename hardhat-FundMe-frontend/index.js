import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, address } from "./constants.js";

const connectbtn = document.querySelector(".connectBtn");
const fundbtn = document.querySelector(".fundBtn");
const balancebtn = document.querySelector(".balanceBtn");

connectbtn.addEventListener("click", async () => {
    await connect();
});

fundbtn.addEventListener("click", async () => {
    await fund();
});

balancebtn.addEventListener("click", async () => {
    await getBalance();
});

const connect = async () => {
    if (window.ethereum !== "undefined") {
        window.ethereum.request({ method: "eth_requestAccounts" });
        connectbtn.innerHTML = "Connected";
    } else {
        connectbtn.innerHTML = "Please install metamask";
    }
};

const getBalance = async () => {
    if (window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(address);
        console.log(ethers.utils.formatEther(balance));
    }
};

const fund = async () => {
    const ethAmount = "0.1";
    console.log(`Funding with ${ethAmount}...`);
    try {
        if (window.ethereum !== "undefined") {
            //Connecting metamask to javascript
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            //Returns the account connected to metamask
            const signer = provider.getSigner();
            const contract = new ethers.Contract(address, abi, signer);
            const txRes = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTranscationMine(txRes, provider);
        }
    } catch (error) {
        console.log(error);
    }
};

const listenForTransactionMine = (txRes, provider) => {
    console.log(`Mining ${txRes.hash}`);
    return new Promise((resolve, reject) => {
        provider.once(txRes.hash, (txReceipt) => {
            console.log(
                `Completed with ${txReceipt.confirmations} confirmations`
            );
            resolve(txReceipt);
        });
    });
};
