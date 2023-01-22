import { ethers, Wallet } from "ethers"

export default class WalletManager {
  private static readonly localStorageAccountName = "accounts"
  private static readonly localStorageSelectedAccountName = "selected_account"

  static setSelectedAccount(wallet: Wallet) {
    this.setSelectedMnemonic(wallet.mnemonic.phrase)
  }

  static setSelectedMnemonic(mnemonic: string) {
    localStorage.setItem(this.localStorageSelectedAccountName, mnemonic)
  }

  static getSelectedAccount(): Wallet | undefined {
    const mnemonic = localStorage.getItem(this.localStorageSelectedAccountName)
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
      this.localStorageAccountName,
      JSON.stringify(updatedMnemonics)
    )
  }

  static getMnemonics(): string[] {
    let accounts: string[] = []
    const storedAccounts = localStorage.getItem(this.localStorageAccountName)
    if (storedAccounts) {
      accounts = JSON.parse(storedAccounts)
    }

    return accounts
  }

  private static saveMnemonic(mnemonic: string) {
    const accounts = this.getMnemonics()
    accounts.push(mnemonic)
    localStorage.setItem(this.localStorageAccountName, JSON.stringify(accounts))
  }
}
