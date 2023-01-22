import { ExclamationTriangleIcon } from "@heroicons/react/24/solid"
interface Props {
  message?: string | null
}

const ErrorMessage: React.FC<Props> = ({ message }) => {
  if (!message) {
    return <></>
  }

  return (
    <div className="flex flex-row items-center gap-2 bg-red-100 border-[1px] border-red-500 rounded-lg w-[50vw] p-[.5em] text-xs">
      <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
      {message}
    </div>
  )
}

export default ErrorMessage
