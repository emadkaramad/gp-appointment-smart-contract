import { ethers, Wallet } from "ethers"

export default class WalletManager {
  private static readonly localStorageName = "accounts"

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
      this.localStorageName,
      JSON.stringify(updatedMnemonics)
    )
  }

  static getMnemonics(): string[] {
    let accounts: string[] = []
    const storedAccounts = localStorage.getItem(this.localStorageName)
    if (storedAccounts) {
      accounts = JSON.parse(storedAccounts)
    }

    return accounts
  }

  private static saveMnemonic(mnemonic: string) {
    const accounts = this.getMnemonics()
    accounts.push(mnemonic)
    localStorage.setItem(this.localStorageName, JSON.stringify(accounts))
  }
}
