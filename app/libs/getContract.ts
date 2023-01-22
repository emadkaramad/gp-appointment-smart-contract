import { ethers } from "ethers"
import contracts from "../constants/contracts.json"
import type { GP } from "../../hardhat/typechain-types/GP"
import type SignerOrProvider from "../types/SignerOrProvider"
import { useContext } from "react"
import AppContext from "../pages/AppContext"

interface ExportedContracts {
  contracts: {
    GP: {
      address: string
      abi: ethers.ContractInterface
    }
  }
}

export default function getContract(provider: SignerOrProvider) {
  const { chainId } = useContext(AppContext)
  const { address: contractAddress, abi: contractAbi } = (
    contracts as unknown as ExportedContracts[][]
  )[chainId][0].contracts.GP

  return new ethers.Contract(contractAddress, contractAbi, provider) as GP
}
