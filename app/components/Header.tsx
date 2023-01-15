import { BigNumber, ethers, Wallet } from "ethers"
import { useState } from "react"
import AccountsModal from "./AccountsModal"
import AddressLabel from "./AddressLabel"
import BalanceLabel from "./BalanceLabel"
import Button from "./Button"

interface Props {
  provider?: ethers.providers.Provider
  selectedAccount?: Wallet
  onSelectAccount: (account: Wallet) => void
}

const Header: React.FC<Props> = ({ provider, selectedAccount, onSelectAccount }) => {
  const [isAccountsModalVisible, setIsAccountsModalVisible] = useState<boolean>()
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from("0"))

  const selectAccount = (account: Wallet) => {
    setIsAccountsModalVisible(false)
    onSelectAccount(account)
  }

  return (
    <header className="flex row p-5 bg-black text-white">
      <p className="flex-1">
        {!selectedAccount?.address && <>{"You are not connected"}</>}
        {selectedAccount?.address && (
          <>
            <AddressLabel>{selectedAccount?.address}</AddressLabel>
            {" ("}
            <BalanceLabel balance={balance} />
            {")"}
          </>
        )}
      </p>
      <p className="flex-0 bg-slate-100">
        <Button onClick={() => setIsAccountsModalVisible(true)}>
          {selectedAccount?.address ? "Change account" : "Connect"}
        </Button>
      </p>

      {isAccountsModalVisible && (
        <AccountsModal
          provider={provider}
          selectedAccount={selectedAccount}
          selectAccount={selectAccount}
          onClose={() => setIsAccountsModalVisible(false)}
        />
      )}
    </header>
  )
}

export default Header
