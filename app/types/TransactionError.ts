import ethers from "ethers"
type TransactionError = {
  code: string
  method: string
  errorName: string
  errorSignature: string
  transaction: ethers.Transaction
}

export default TransactionError
