import { useCallback, useContext, useEffect, useState } from "react"
import ErrorMessage from "../components/ErrorMessage"
import getContract from "../libs/getContract"
import AppContext from "../pages/AppContext"
import ethers from "ethers"
import TransactionError from "../types/TransactionError"
import ButtonsRow from "../components/ButtonsRow"
import Button from "../components/Button"

const AdminsList: React.FC = () => {
  const { provider, selectedAccount } = useContext(AppContext)
  const [admins, setAdmins] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>()
  const contract = getContract(provider)

  const handleAdminsList = useCallback(async () => {
    if (!selectedAccount || !provider) {
      return
    }

    try {
      setAdmins(
        await contract.connect(provider).getAdmins({
          from: selectedAccount.address
        })
      )

      setErrorMessage(null)
    } catch (error) {
      setErrorMessage((error as TransactionError).errorName)
    }
  }, [selectedAccount, provider])

  useEffect(() => {
    handleAdminsList()
  }, [selectedAccount])

  return (
    <>
      <ErrorMessage message={errorMessage} />
      {!errorMessage && (
        <>
          <ButtonsRow>
            <Button onClick={() => {}}>Add</Button>
          </ButtonsRow>
          <div className="flex flex-col min-w-full">
            {admins.map((admin) => (
              <div key={admin} className="w-[300px] px-[2em]">
                <p>{admin}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default AdminsList
