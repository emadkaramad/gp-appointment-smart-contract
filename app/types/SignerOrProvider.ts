import type { ethers } from "ethers"

type SignerOrProvider = ethers.providers.Provider | ethers.Signer | undefined

export default SignerOrProvider
