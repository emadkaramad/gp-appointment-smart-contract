import { ethers, Wallet } from "ethers"

const defaultMnemonic = "test test test test test test test test test test test junk"
const localStorageAccountName = "accounts"
const localStorageSelectedAccountName = "selected_account"

export default class WalletManager {
  static setSelectedAccount(wallet: Wallet) {
    this.setSelectedMnemonic(wallet.mnemonic.phrase)
  }

  static setSelectedMnemonic(mnemonic: string) {
    localStorage.setItem(localStorageSelectedAccountName, mnemonic)
  }

  static getSelectedAccount(): Wallet | undefined {
    const mnemonic = localStorage.getItem(localStorageSelectedAccountName)
    return mnemonic ? Wallet.fromMnemonic(mnemonic) : undefined
  }

  static createNew(): Wallet {
    const account = Wallet.createRandom()
    this.saveMnemonic(account.mnemonic.phrase)

    return account
  }

  static remove(wallet: Wallet) {
    this.removeByMnemonic(wallet.mnemonic.phrase)
  }

  static removeByMnemonic(mnemonic: string) {
    const mnemonics = this.getMnemonics()
    const updatedMnemonics = mnemonics.filter((x) => x !== mnemonic)
    localStorage.setItem(
      localStorageAccountName,
      JSON.stringify(updatedMnemonics)
    )
  }

  static getMnemonics(): string[] {
    let accounts: string[] = [defaultMnemonic]
    const storedAccounts = localStorage.getItem(localStorageAccountName)
    if (storedAccounts) {
      accounts = JSON.parse(storedAccounts)
    }

    return accounts
  }

  private static saveMnemonic(mnemonic: string) {
    const accounts = this.getMnemonics()
    accounts.push(mnemonic)
    localStorage.setItem(localStorageAccountName, JSON.stringify(accounts))
  }
}
