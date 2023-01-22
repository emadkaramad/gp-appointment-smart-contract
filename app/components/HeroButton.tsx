interface Props {
  children: React.ReactNode
  href: string
}

const HeroButton: React.FC<Props> = ({ children, href }) => {
  return (
    <a
      className="px-8 py-4 border-white border-[1px] rounded-md bg-black/80 text-white hover:text-black hover:bg-white uppercase tracking-wider"
      href={href}
    >
      {children}
    </a>
  )
}

export default HeroButton
