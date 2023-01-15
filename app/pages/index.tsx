import Head from "next/head"
import { Wallet } from "ethers"
import React, { useState } from "react"
import Header from "../components/Header"
import useStaticJsonRpc from "../libs/useStaticJsonRpc"
import getContract from "../libs/getContract"

const chainId = 31337 // Hardhat
const hardhatAddress = "http://localhost:8545" // window.ethereum

export default function Home() {
  const provider = useStaticJsonRpc(hardhatAddress)
  const [selectedAccount, setSelectedAccount] = useState<Wallet>()
  const contract = getContract(provider, chainId)

  const selectAccount = (account: Wallet) => {
    if (provider) {
      setSelectedAccount(account.connect(provider))
    }
  }

  return (
    <>
      <Head>
        <title>Simple GP Appointment Smart Contract</title>
        <meta
          name="description"
          content="Simple GP Appointment Smart Contract"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        {provider && (
          <Header
            provider={provider}
            selectedAccount={selectedAccount}
            onSelectAccount={selectAccount}
          />
        )}
      </main>
    </>
  )
}
