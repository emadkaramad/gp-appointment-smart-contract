import { ethers } from "ethers"
import { useCallback, useEffect, useState } from "react"

type ProviderUrl = string | ethers.utils.ConnectionInfo | undefined

export default function useStaticJsonRpc(url: ProviderUrl) {
  const [provider, setProvider] =
    useState<ethers.providers.StaticJsonRpcProvider>()

  const handleProvider = useCallback(async () => {
    try {
      const rpcProvider = new ethers.providers.StaticJsonRpcProvider(url)
      await rpcProvider.ready
      setProvider(rpcProvider)
    } catch (error) {
      console.log(error)
    }
  }, [url])

  useEffect(() => {
    handleProvider().then(() => console.log("Connected"))
  }, [url])

  return provider
}
