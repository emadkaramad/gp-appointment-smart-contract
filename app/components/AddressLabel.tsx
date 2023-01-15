interface Props {
  children: React.ReactNode
  withBackground?: boolean
}

const AddressLabel: React.FC<Props> = ({ children, withBackground }: Props) => {
  const address = children?.toString()
  const addressToDisplay = `${address?.slice(0, 6)}...${address?.slice(-4)}`
  return (
    <span
      className={withBackground ? "bg-slate-200 rounded-[5px] px-2" : ""}
      title={address}
    >
      {addressToDisplay}
    </span>
  )
}

export default AddressLabel
