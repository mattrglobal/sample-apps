import React from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { Square3Stack3DIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { JsonView, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

const req = {
  payload: {
    name: "DEBUG",
    type: ["DebugCredential"],
    issuer: {
      id: "did:key:z6MkuYcM1HT8uMmxcytUScjH5ZQmWCLShbCTvu8kPvUPmdQP",
      name: "TEST",
    },
    credentialSubject: {
      id: "did:key:z6MkhhP1NDTGB9DEzUvRbRsomD4954uJ5arhH6AWgPjntSG2",
      for: "Debugging",
    },
  },
};

const res = {
  id: "f653cc88-0879-4fac-9440-860b0825fa6a",
  credential: {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://mattr.global/contexts/vc-extensions/v2",
    ],
    type: ["VerifiableCredential", "DebugCredential"],
    issuer: {
      id: "did:key:z6MkuYcM1HT8uMmxcytUScjH5ZQmWCLShbCTvu8kPvUPmdQP",
      name: "TEST",
    },
    name: "DEBUG",
    issuanceDate: "2023-06-05T06:45:20.964Z",
    credentialSubject: {
      id: "did:key:z6MkhhP1NDTGB9DEzUvRbRsomD4954uJ5arhH6AWgPjntSG2",
      for: "Debugging",
    },
    proof: {
      type: "Ed25519Signature2018",
      created: "2023-06-05T06:45:20Z",
      jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..2YbDpqb1DebjyobVL_pcz6idLVwmVxCDBmEijLaJs6mqZd0R8vpyQpiUet8wKk6A2CX9lZSA_Lz9k1zFt3LoCQ",
      proofPurpose: "assertionMethod",
      verificationMethod:
        "did:key:z6MkuYcM1HT8uMmxcytUScjH5ZQmWCLShbCTvu8kPvUPmdQP#z6MkuYcM1HT8uMmxcytUScjH5ZQmWCLShbCTvu8kPvUPmdQP",
    },
  },
  issuanceDate: "2023-06-05T06:45:20.964Z",
};

export default function CreateCredentialData() {
  const { createCredential } = useSelector((state: RootState) => state.issuanceReducer);
  const data = [
    {
      label: "Request body",
      value: "dashboard",
      icon: Square3Stack3DIcon,
      desc: (
        <JsonView
          data={createCredential?.reqBody ? createCredential.reqBody : {}}
          shouldInitiallyExpand={() => true}
          style={darkStyles}
        />
      ),
    },
    {
      label: "Response body",
      value: "profile",
      icon: UserCircleIcon,
      desc: (
        <JsonView
          data={res}
          shouldInitiallyExpand={() => true}
          style={darkStyles}
        />
      ),
    },
  ];
  return (
    <Tabs value="dashboard">
      <TabsHeader>
        {data.map(({ label, value, icon }) => (
          <Tab key={value} value={value}>
            <div className="flex items-center gap-2">
              {React.createElement(icon, { className: "w-5 h-5" })}
              {label}
            </div>
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody>
        {data.map(({ value, desc }) => (
          <TabPanel key={value} value={value} className={"w-full"}>
            {desc}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  );
}
