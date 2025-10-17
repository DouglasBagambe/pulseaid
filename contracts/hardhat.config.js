import "dotenv/config";
import "@nomicfoundation/hardhat-ethers";

export default {
  solidity: "0.8.23",
  networks: {
    celoSepolia: {
      url: process.env.CELO_SEPOLIA_RPC || "https://forno.celo-sepolia.celo-testnet.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 11142220,
      gasPrice: "auto",
    },
    alfajores: {
      url: process.env.ALFAJORES_RPC || "https://alfajores-forno.celo-testnet.org",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};