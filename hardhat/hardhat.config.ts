import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "hardhat-deploy"

const config: HardhatUserConfig = {
  solidity: "0.8.17",

  networks: {
    hardhat: {
      live: false,
      saveDeployments: true,
      tags: ["test", "local"],
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
      31337: 0,
    },
  },

  paths: {
    deployments: "../app/constants",
  },
}

export default config
