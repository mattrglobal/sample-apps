import IssueCredentialForm from "@/templates/IssueCredentialForm";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>E2E Issuer & Verifier</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <IssueCredentialForm />
      </main>
    </>
  );
}
