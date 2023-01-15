import { ethers } from "hardhat"
import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const tags = ["GP"]

const deployFunction: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()
  await deploy("GP", {
    from: deployer,
    args: ["Simple GP", "Admin (Deployer)"],
    log: true,
    value: ethers.utils.parseEther("5.0")
  })
}

export default deployFunction
export { tags }
