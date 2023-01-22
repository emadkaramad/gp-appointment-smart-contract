interface Props {
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  secondary?: boolean
}

const Button: React.FC<Props> = ({ children, onClick, secondary }) => {
  let classNames =
    "bg-white hover:bg-blue-500 hover:text-white border-[1px] px-3 py-1 text-black border-black "
  if (secondary) {
    classNames += "border-dotted"
  } else {
    classNames += "border-solid"
  }

  return (
    <button className={classNames} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
