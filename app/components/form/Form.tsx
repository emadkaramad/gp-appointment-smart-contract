interface Props {
  children: React.ReactNode
}

const Form: React.FC<Props> = ({ children }) => <form>{children}</form>

export default Form
