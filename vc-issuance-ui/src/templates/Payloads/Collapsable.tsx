import { Fragment, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import TenantConfigData from "@/templates/payloads/TenantConfigData";
import IssuerDidData from "@/templates/payloads/IssuerDidData";
import CreateCredentialData from "@/templates/payloads/CreateCredentialData";
import { type RootState } from "@/store/store";
import { useSelector } from "react-redux";

export enum DATA_TYPE {
  TENANT_CONFIG = "Tenant Configuration",
  ISSUER_DID_DOCUMENT = "Issuer DID Document",
  CREATE_CREDENTIAL = "Payloads - Create Credential",
  ISSUE_CREDENTIAL = "Payloads - Issue Credential (Encrypt & Send Message)",
}

const PLACEHOLDER = () => (
  <p>
    We&apos;re not always in the position that we want to be at. We&apos;re
    constantly growing. We&apos;re constantly making mistakes. We&apos;re
    constantly trying to express ourselves and actualize our dreams.
  </p>
);

type CollapsableProps = {
  header: DATA_TYPE;
  accordionTitle: `Data - ${DATA_TYPE}`;
  component: React.ReactNode;
  openAccordion?: boolean;
};

type IconProps = {
  id: number;
  open: number;
};

const Icon = ({ id, open }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`${
        id === open ? "rotate-180" : ""
      } h-5 w-5 transition-transform`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
};

export default function Collapsable() {
  const [open, setOpen] = useState(0);
  const state = useSelector((state: RootState) => state.issuanceReducer);

  const contents: CollapsableProps[] = [
    {
      header: DATA_TYPE.TENANT_CONFIG,
      accordionTitle: "Data - Tenant Configuration",
      component: <TenantConfigData />,
      // openAccordion: !state.config,
    },
    {
      header: DATA_TYPE.ISSUER_DID_DOCUMENT,
      accordionTitle: "Data - Issuer DID Document",
      component: <IssuerDidData />,
      // openAccordion: state.config !== undefined,
    },
    {
      header: DATA_TYPE.CREATE_CREDENTIAL,
      accordionTitle: "Data - Payloads - Create Credential",
      component: <CreateCredentialData />,
    },
    {
      header: DATA_TYPE.ISSUE_CREDENTIAL,
      accordionTitle:
        "Data - Payloads - Issue Credential (Encrypt & Send Message)",
      component: <CreateCredentialData />,
    },
  ];

  const handleOpen = (value: number) => {
    setOpen(open === value ? 0 : value);
  };

  return (
    <Fragment>
      {contents.map((d, _i) => (
        <Accordion
          key={_i}
          open={open === _i + 1}
          icon={<Icon id={_i + 1} open={open} />}
        >
          <AccordionHeader onClick={() => handleOpen(_i + 1)}>
            {d.header}
          </AccordionHeader>
          <AccordionBody>{d.component}</AccordionBody>
        </Accordion>
      ))}
    </Fragment>
  );
}
