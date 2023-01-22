import { createContext } from "react"
import { ethers, Wallet } from "ethers"
export interface GPAppContext {
  chainId: number
  provider?: ethers.providers.Provider
  selectedAccount?: Wallet
  selectAccount: (account: Wallet) => void
}

export const hardhatContext = {
  chainId: 31337, // Hardhat
  selectAccount: () => {}
}

const AppContext = createContext<GPAppContext>(hardhatContext)

export default AppContext
