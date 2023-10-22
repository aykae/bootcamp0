import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv";
import { configDotenv } from "dotenv";

configDotenv();

const { API_URL, PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
  networks: {
	hardhat: {},
	mumbai: {
  	url: API_URL,
  	accounts: [`0x${PRIVATE_KEY}`]
	}
  }
};

export default config;
