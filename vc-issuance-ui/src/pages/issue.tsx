import Layout from "@/components/Layout";
import MultiStepForm from "@/components/MultiStepForm";
import CreateCredential from "@/templates/form/CreateCredential";
import IssuerPicker from "@/templates/form/IssuerPicker";
import TenantConfig from "@/templates/form/TenantConfig";
import { type NextPage } from "next";
import Head from "next/head";

const Issue: NextPage = () => {
  return (
    <>
      <Head>
        <title>Direct Credential Issuance</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="w-full">
        <TenantConfig />
        <IssuerPicker />
        <CreateCredential />
        {/* <MultiStepForm /> */}
        {/* <Layout /> */}
      </body>
    </>
  );
};

export default Issue;
