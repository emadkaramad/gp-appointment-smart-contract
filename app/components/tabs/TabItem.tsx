import React from "react"

interface Props {
  children: React.ReactNode
  id: string
  onSelected: () => void
  active?: boolean
}

const TabItem: React.FC<Props> = ({ children, active, id, onSelected }) => (
  <li className="nav-item" role="presentation">
    <a
      href={`#${id}`}
      onClick={onSelected}
      className={`
        nav-link
        block
        font-medium
        text-xs
        leading-tight
        uppercase
        border-x-0 border-t-0 border-b-2 border-transparent
        px-6 py-3 my-2
        hover:bg-gray-100
        ${active ? "border-b-blue-500 text-blue-500" : ""}`}
      role="tab"
      aria-controls="tabs-home"
      aria-selected={active}
    >
      {children}
    </a>
  </li>
)

export default TabItem
