interface Props {
  children: React.ReactNode
  className?: string
}

const H1: React.FC<Props> = ({ children, className }) => (
  <h1 className={`text-4xl ${className}`}>{children}</h1>
)

const H2: React.FC<Props> = ({ children, className }) => (
  <h2 className={`text-2xl ${className}`}>{children}</h2>
)

export { H1, H2 }
