import "../styles/globals.css"
import type { AppProps } from "next/app"
import AppContext, { GPAppContext, hardhatContext } from "./AppContext"
import useStaticJsonRpc from "../libs/useStaticJsonRpc"
import WalletManager from "../libs/WalletManager"
import { useEffect, useState } from "react"
import { Wallet } from "ethers"

export default function App({ Component, pageProps }: AppProps) {
  const provider = useStaticJsonRpc("http://localhost:8545")
  const [selectedAccount, setSelectedAccount] = useState<Wallet>()

  useEffect(() => {
    setSelectedAccount(WalletManager.getSelectedAccount())
  }, [provider])

  const selectAccount = (account: Wallet) => {
    if (provider) {
      WalletManager.setSelectedAccount(account)
      setSelectedAccount(account.connect(provider))
    }
  }

  const context: GPAppContext = {
    ...hardhatContext,
    provider,
    selectedAccount,
    selectAccount
  }

  return (
    <AppContext.Provider value={context}>
      <Component {...pageProps} />
    </AppContext.Provider>
  )
}
