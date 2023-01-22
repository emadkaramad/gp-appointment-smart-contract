import React, { useContext } from "react"
import { H1, H2 } from "../components/Heading"
import HeroButton from "../components/HeroButton"
import Page from "../components/Page"
import AppContext from "./AppContext"

export default function Home() {
  const { selectedAccount } = useContext(AppContext)

  return (
    <Page dark full>
      <div className="text-[8em] absolute top-[.7em] left-0 text-white/30 uppercase tracking-wider">
        GP
        <br />
        Appointment
        <br />
        Smart Contract
      </div>
      <div className="my-[3em] text-center">
        {/* <H1>GP Appointment System</H1> */}

        {selectedAccount && (
          <>
            <H1>Which view would you like to access?</H1>
            <div className="child:mx-4 absolute top-[40%] left-[50%] translate-x-[-50%]">
              <HeroButton href="/admin">Admin</HeroButton>
              <HeroButton href="/doctor">Doctor</HeroButton>
              <HeroButton href="/patient">Patient</HeroButton>
            </div>
          </>
        )}
      </div>
    </Page>
  )
}
