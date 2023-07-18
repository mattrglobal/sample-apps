import CustomTabs from "@/components/Tabs";
import IssueCredentialForm from "@/templates/IssueCredentialForm";
import PresentationRequestForm from "@/templates/PresentationRequestForm";
import { Button } from "@material-tailwind/react";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>E2E Issuer & Verifier</title>
      </Head>
      <main>
      <CustomTabs />
        {/* <IssueCredentialForm />
        <PresentationRequestForm /> */}
      </main>
    </>
  );
}
