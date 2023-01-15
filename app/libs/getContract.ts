import { ethers } from "ethers"
import contracts from "../constants/contracts.json"
import type { GP } from "../../hardhat/typechain-types/GP"
import type SignerOrProvider from "../types/SignerOrProvider"

export default function getContract(
  provider: SignerOrProvider,
  chainId: number
) {
  const { address: contractAddress, abi: contractAbi } = (contracts as any)[
    chainId
  ][0].contracts.GP

  return new ethers.Contract(contractAddress, contractAbi, provider) as GP
}
