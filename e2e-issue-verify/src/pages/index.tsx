import { api } from "@/utils/api";
import Head from "next/head";

export default function Home() {
  const data = api.mattrRoutes.hello.useQuery({ text: "test" })
  console.log(`data.data: ${JSON.stringify(data.data)}`)
  return (
    <>
      <Head>
        <title>E2E Issuer & Verifier</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        UI
      </main>
    </>
  );
}
