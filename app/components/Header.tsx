import { BigNumber, ethers, Wallet } from "ethers"
import { useContext, useState } from "react"
import AppContext from "../pages/AppContext"
import AccountsModal from "./AccountsModal"
import AddressLabel from "./AddressLabel"
import BalanceLabel from "./BalanceLabel"
import Button from "./Button"

const Header: React.FC = () => {
  const { provider, selectAccount, selectedAccount } = useContext(AppContext)
  const [isAccountsModalVisible, setIsAccountsModalVisible] =
    useState<boolean>()
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from("0"))

  const selectTheAccount = (account: Wallet) => {
    setIsAccountsModalVisible(false)
    selectAccount(account)
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
          selectAccount={selectTheAccount}
          onClose={() => setIsAccountsModalVisible(false)}
        />
      )}
    </header>
  )
}

export default Header
