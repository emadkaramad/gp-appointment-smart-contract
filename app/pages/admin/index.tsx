import Head from "next/head"
import { useContext, useState } from "react"
import Header from "../../components/Header"
import Page from "../../components/Page"
import { TabGroup } from "../../components/tabs"
import AdminsList from "../../features/AdminsList"
import getContract from "../../libs/getContract"
import AppContext from "../AppContext"

type TabIds = "admins" | "doctors" | "patients"

export default function Admins() {
  const { provider } = useContext(AppContext)
  const [selectedTab, setSelectedTab] = useState<TabIds>()
  const contract = getContract(provider)

  return (
    <Page>
      <TabGroup
        tabs={[
          { title: "Admins", id: "admins" },
          { title: "Doctors", id: "doctors" },
          { title: "Patients", id: "patients" }
        ]}
        onSelected={(tabId) => setSelectedTab(tabId as TabIds)}
      />

      {selectedTab === "admins" && <AdminsList />}
    </Page>
  )
}
