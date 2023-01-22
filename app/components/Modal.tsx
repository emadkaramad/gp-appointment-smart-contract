import { MouseEvent } from "react"

interface Props {
  title: string
  children: React.ReactNode
  onClose?: () => void
}

const Modal: React.FC<Props> = ({ title, children, onClose }: Props) => {
  const closeModal = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }
  return (
    <div
      className="fixed top-[0px] left-[0px] w-[100vw] h-[100vh] z-50 bg-black/20 text-black"
      onClick={closeModal}
    >
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[50vw] min-w-[500px] bg-white px-[2em] py-[1em]">
        <h2 className="text-2xl mt-[.5em] mb-[1.5em]">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  )
}

export default Modal
