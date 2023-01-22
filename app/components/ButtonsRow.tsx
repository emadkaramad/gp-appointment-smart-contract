interface Props {
  children: React.ReactNode
}

const ButtonsRow: React.FC<Props> = ({ children }) => (
  <div className="my-[1em] text-right child:mx-[.25em]">{children}</div>
)

export default ButtonsRow
