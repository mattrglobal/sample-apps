import React, { useEffect } from "react";
import { Stepper, Step, Button } from "@material-tailwind/react";
import {
  LockClosedIcon,
  CreditCardIcon,
  PaperAirplaneIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import TenantConfig from "@/templates/form/TenantConfig";
import IssuerPicker from "@/templates/form/IssuerPicker";
import { useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import CreateCredential from "@/templates/form/CreateCredential";
// import { BuildingLibraryIcon } from "@heroicons/react/24/solid";

enum STEP {
  CONFIG_TENANT = "Setup your tenant",
  PICK_ISSUER = "Pick an issuer",
  CREATE_CREDENTIAL = "Create your credential",
  SEND_CREDENTIAL = "Issue credential to wallet",
}

type FormStep = {
  title: STEP;
  component: React.ReactNode;
  icon: React.ReactNode;
};

const Content = (props: { title: string }) => (
  <h1 className="text-red-600">{props.title}</h1>
);

const steps: FormStep[] = [
  {
    title: STEP.CONFIG_TENANT,
    component: <TenantConfig />,
    icon: <LockClosedIcon className="h-5 w-5" />,
  },
  {
    title: STEP.PICK_ISSUER,
    component: <IssuerPicker />,
    icon: <BuildingLibraryIcon className="h-5 w-5" />,
  },
  {
    title: STEP.CREATE_CREDENTIAL,
    component: <CreateCredential />,
    icon: <CreditCardIcon className="h-5 w-5" />,
  },
  {
    title: STEP.SEND_CREDENTIAL,
    component: <Content title={STEP.SEND_CREDENTIAL} />,
    icon: <PaperAirplaneIcon className="h-5 w-5" />,
  },
];

const MultiStepForm = () => {
  const state = useSelector((state: RootState) => state.issuanceReducer);
  const { config } = state;
  const [activeStep, setActiveStep] = React.useState(0);
  const [isLastStep, setIsLastStep] = React.useState(false);
  const [isFirstStep, setIsFirstStep] = React.useState(false);

  const disableNextStep =
    isLastStep ||
    !config 
    // !config?.tenantDomain ||
    // !config.createAuthToken?.resBody?.access_token ||
    // !issuer;

  const handleNext = () => !isLastStep && setActiveStep((cur) => cur + 1);
  const handlePrev = () => !isFirstStep && setActiveStep((cur) => cur - 1);

  return (
    <div className="w-full px-8 py-4">
      <Stepper
        activeStep={activeStep}
        isLastStep={(value) => setIsLastStep(value)}
        isFirstStep={(value) => setIsFirstStep(value)}
      >
        {steps.map((s, i) => (
          <Step key={i} onClick={() => setActiveStep(i)}>
            {s.icon}
          </Step>
        ))}
      </Stepper>
      <div className="mt-32 flex justify-center">
        {steps[activeStep]?.component}
      </div>
      <div className="mt-32 flex justify-between">
        <Button onClick={handlePrev} disabled={isFirstStep}>
          Prev
        </Button>
        <Button onClick={handleNext} disabled={disableNextStep}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default MultiStepForm;
