import { BigNumber, ethers } from "ethers"

interface Props {
  balance?: BigNumber
  withBackground?: boolean
}

const BalanceLabel: React.FC<Props> = ({ balance, withBackground }: Props) => {
  const formattedBalance = balance ? ethers.utils.formatEther(BigNumber.from(balance)) : "-.-"
  return (
    <span
      className={withBackground ? "bg-slate-200 rounded-[5px] px-2" : ""}
      title={`${balance} Wei`}
    >
      {formattedBalance}
      {" ETH"}
    </span>
  )
}

export default BalanceLabel
