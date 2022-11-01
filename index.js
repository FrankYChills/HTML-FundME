console.log("Hello franky :)");

//imports
import { Contract, ethers } from "./ethers-5.1.esm.min.js";
import { ABI } from "./constants.js";
import { CONTRACT_ADDRESS } from "./constants.js";

//FE-buttons
const connectButton = document.getElementById("connect");
const fundButton = document.getElementById("fund");
const balanceButton = document.getElementById("getBalance");
const withdrawButton = document.getElementById("withdraw");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

// connect to wallet
async function connect() {
  if (typeof window.ethereum != "undefined") {
    console.log("Metamask detected");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Account Connected");
    document.getElementById("connect").innerText = "Connected";
  }
}

// fund to the wallet
async function fund() {
  // ethAmount - ETH || txAmount - Wei
  // Inside contracts txs are done in terms of WEI
  const ethAmount = document.getElementById("ethAmount").value;

  console.log(`Funding Contract with amount : ${ethAmount} ETH`);

  const txAmount = (Number(ethAmount) * 1000000000000000000).toString();
  console.log(`txAmount:${txAmount}`);
  if (typeof window.ethereum != "undefined") {
    // get provider/ connection to the blockchain | Signer/wallet/someone with some gas | contract we are interacting with(ABI and Address)
    // for contract address we can deploy backend locally for now(via- yarn hardhat node)
    // ethers will search for the endpoint url for blockchain interface that is basically metamask here
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // console.log(provider);
    // get the account connected to the local chain node via metamask

    const signer = provider.getSigner();
    // import account from localhost to metamask for having funds in account in localhost network in metamask

    // console.log(signer);
    // get the contract we are going to interact with which is deployed on chain node
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    // console.log(contract);
    try {
      const txResponse = await contract.fund({ value: txAmount });
      await listenForTxMine(txResponse, provider);
      console.log("Transaction Completed");
    } catch (error) {
      console.log("Some error happened!");
      console.log(error);
    }
  }
}

//Console log Tx confirmation func
function listenForTxMine(txResponse, provider) {
  console.log(`Mining ${txResponse.hash}....`);
  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (txReceipt) => {
      console.log(`Completed with ${txReceipt.confirmations} confirmations.`);
      resolve();
    });
  });
}

// get the balance of the contract
async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    console.log("Fetching the balance from the contract");
    // get the provider on web or web3 aka metamask (kind of third important app other being FE and chain aka localhost node)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // we can get balance of any contract bia getBalance funxn
    const balance = await provider.getBalance(CONTRACT_ADDRESS);
    const balanceETH = (balance / 1000000000000000000).toString();
    document.getElementById(
      "showBalance"
    ).innerHTML = `<b> Contract's Current balance is ${balanceETH} ETH <b>`;
    console.log(balanceETH);
  }
}

// withdraw the balance from contract to deployers acc
async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    console.log("Withdrawing funds from the contract ...");
    // get the provider on web or web3 aka metamask (kind of third important app other being FE and chain aka localhost node)
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // get the account connected to the local chain node via metamask

    const signer = provider.getSigner();
    // get the contract we are going to interact with which is deployed on chain node
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    try {
      const txResponse = await contract.withdraw();
      await listenForTxMine(txResponse, provider);
      console.log("Withdraw Successfull :)");
    } catch (error) {
      console.log(error);
    }
  }
}
