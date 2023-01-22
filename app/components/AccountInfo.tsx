import { BigNumber, ethers, Wallet } from "ethers"
import { useCallback, useEffect, useState } from "react"
import AddressLabel from "./AddressLabel"
import BalanceLabel from "./BalanceLabel"
import Button from "./Button"
import { TrashIcon } from "@heroicons/react/24/solid"

interface Props {
  provider?: ethers.providers.Provider
  mnemonic: string
  isSelected: boolean
  highlight: boolean
  onSelectAccount: (account: Wallet) => void
  onRemoveAccount: (account: Wallet) => void
}

const AccountInfo: React.FC<Props> = ({
  provider,
  mnemonic,
  isSelected,
  highlight,
  onSelectAccount,
  onRemoveAccount
}) => {
  const wallet = Wallet.fromMnemonic(mnemonic)

  const [balance, setBalance] = useState<BigNumber>()

  const accountInfoHandler = useCallback(async () => {
    if (!provider) {
      return
    }

    const latestBalance = await wallet.connect(provider).getBalance()
    if (latestBalance) {
      setBalance(latestBalance)
    }
  }, [provider, mnemonic])

  useEffect(() => {
    accountInfoHandler()
  }, [accountInfoHandler])

  const highlightClassNames = highlight ? "bg-amber-50" : ""
  const selectedRowClassNames = isSelected
    ? "border-[2px] cursor-default"
    : "hover:bg-slate-200 cursor-pointer border-[1px]"

  return (
    <div
      className={`my-[.5em] p-[.5em] border-black flex ${highlightClassNames} ${selectedRowClassNames}`}
    >
      <div
        className="flex-1"
        onClick={() => !isSelected && onSelectAccount(wallet)}
      >
        <AddressLabel>{wallet.address}</AddressLabel>
      </div>
      <div onClick={() => !isSelected && onSelectAccount(wallet)}>
        <BalanceLabel balance={balance} />
      </div>
      {!isSelected && (
        <div className="mx-[.5em]">
          <Button onClick={() => onRemoveAccount(wallet)}>
            <TrashIcon className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default AccountInfo
