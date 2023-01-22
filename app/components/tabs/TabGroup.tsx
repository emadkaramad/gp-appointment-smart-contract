import React, { useState } from "react"
import TabItem from "./TabItem"

interface Props {
  tabs: { title: string; id: string }[]
  onSelected: (tabId: string) => void
}

const TabGroup: React.FC<Props> = ({ tabs, onSelected }) => {
  const [activeTabId, setActiveTabId] = useState<string>()

  const selectTab = (tabId: string) => {
    setActiveTabId(tabId)
    onSelected(tabId)
  }

  return (
    <ul
      className="nav nav-tabs flex flex-col md:flex-row flex-wrap list-none border-b-0 pl-0 mb-4"
      id="tabs-tab"
      role="tablist"
    >
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          id={tab.id}
          active={activeTabId === tab.id}
          onSelected={() => selectTab(tab.id)}
        >
          {tab.title}
        </TabItem>
      ))}
    </ul>
  )
}

export default TabGroup
