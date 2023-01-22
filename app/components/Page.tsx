import Head from "next/head"
import Header from "./Header"

interface Props {
  children: React.ReactNode
  title?: string
  dark?: boolean
  full?: boolean
}

const Page: React.FC<Props> = ({ children, title, dark, full }) => (
  <>
    <Head>
      <title>{title || "Simple GP Appointment Smart Contract"}</title>
      <meta
        name="description"
        content={title || "Simple GP Appointment Smart Contract"}
      />
    </Head>
    <main
      className={`${dark ? "bg-black text-white" : ""} ${
        full ? "min-h-[100vh]" : ""
      }`}
    >
      <Header />
      <div className="container-sm mx-auto px-4">{children}</div>
    </main>
  </>
)

export default Page
