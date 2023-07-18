import IssueCredentialForm from "@/templates/IssueCredentialForm";
import PresentationRequestForm from "@/templates/PresentationRequestForm";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";

export default function CustomTabs() {
  return (
    <Tabs id="custom-animation" value="html">
      <TabsHeader>
        <Tab key={"issue"} value={"issue"}>
          {`Issue Credential`}
        </Tab>
        <Tab key={"verify"} value={"verify"}>
          {`Verify Credential`}
        </Tab>
      </TabsHeader>
      <TabsBody
        animate={{
          initial: { y: 250 },
          mount: { y: 0 },
          unmount: { y: 250 },
        }}
      >
        <TabPanel key={"issue"} value={"issue"}>
          <IssueCredentialForm />
        </TabPanel>
        <TabPanel key={"verify"} value={"verify"}>
          <PresentationRequestForm />
        </TabPanel>
      </TabsBody>
    </Tabs>
  );
}
