import { ethers, Wallet } from "ethers"
import { useEffect, useState } from "react"
import WalletManager from "../libs/WalletManager"
import AccountInfo from "./AccountInfo"
import Button from "./Button"
import ButtonsRow from "./ButtonsRow"
import Modal from "./Modal"

interface Props {
  provider?: ethers.providers.Provider
  selectedAccount?: Wallet
  selectAccount: (account: Wallet) => void
  onClose?: () => void
}

const AccountsModal: React.FC<Props> = ({
  provider,
  selectedAccount: currentSelectedAccount,
  selectAccount,
  onClose,
}: Props) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [mnemonics, setMnemonics] = useState<string[]>([])
  const [recentMnemonics, setRecentMnemonics] = useState<string[]>([])

  const loadMnemonics = () => {
    setMnemonics(WalletManager.getMnemonics())
  }

  const newAccount = () => {
    const wallet = WalletManager.createNew()
    setRecentMnemonics([...recentMnemonics, wallet.mnemonic.phrase])
    loadMnemonics()
  }

  const removeAccount = (account: Wallet) => {
    WalletManager.remove(account)
    loadMnemonics()
  }

  useEffect(() => {
    loadMnemonics()
    setIsInitialized(true)
  }, [provider])

  return (
    <Modal title="Select an account" onClose={onClose}>
      {!isInitialized && <p>Loading...</p>}
      {isInitialized && !mnemonics.length && (
        <p>{"There are no accounts to select."}</p>
      )}
      {isInitialized &&
        mnemonics.map((mnemonic, index) => (
          <AccountInfo
            key={index}
            provider={provider}
            mnemonic={mnemonic}
            onSelectAccount={selectAccount}
            onRemoveAccount={removeAccount}
            isSelected={currentSelectedAccount?.mnemonic.phrase === mnemonic}
            highlight={recentMnemonics.includes(mnemonic)}
          />
        ))}

      <ButtonsRow>
        <Button onClick={onClose} secondary>{"Close"}</Button>
        <Button onClick={newAccount}>{"Create a new account"}</Button>
      </ButtonsRow>
    </Modal>
  )
}

export default AccountsModal
