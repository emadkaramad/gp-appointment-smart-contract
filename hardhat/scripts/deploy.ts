import { ethers } from "hardhat"

async function main() {
  const [deployer] = await ethers.getSigners()
  const Appointments = await ethers.getContractFactory("Appointments")
  const appointments = await Appointments.connect(deployer).deploy()

  await appointments.deployed()

  console.log(`Contract deployed to ${appointments.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
