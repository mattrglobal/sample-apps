import IssueCredentialForm from "@/templates/IssueCredentialForm";
import PresentationRequestForm from "@/templates/PresentationRequestForm";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>E2E Issuer & Verifier</title>
      </Head>
      <main>
        <IssueCredentialForm />
        <PresentationRequestForm />
      </main>
    </>
  );
}
