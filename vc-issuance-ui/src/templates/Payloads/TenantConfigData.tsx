/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { type RootState } from "@/store/store";
import { Button, Input } from "@material-tailwind/react";
import { useSelector } from "react-redux";
import * as CommonService from "@/services/common.service";
import {
  type CreateAuthTokenReqBody,
  type CreateAuthTokenResBody,
} from "@/types/create-auth-token";

type InputFieldProps = {
  label: string;
  value: string;
};
const InputField = (props: InputFieldProps) => (
  <div className="relative flex w-full p-4">
    <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
      {props.label}
    </label>
    <Input
      type="string"
      disabled
      label={props.label}
      value={props.value}
      className="pr-20"
      containerProps={{
        className: "min-w-0",
      }}
    />
    <Button
      size="sm"
      color={"blue"}
      onClick={(e) => CommonService.copyToClipboard}
      className="!absolute right-7 top-5 rounded"
    >
      Copy
    </Button>
  </div>
);

const TenantConfigData = () => {
  const { config } = useSelector((state: RootState) => state.issuanceReducer);
  const reqBody = config?.createAuthToken?.reqBody as CreateAuthTokenReqBody;
  const resBody = config?.createAuthToken?.resBody as CreateAuthTokenResBody;
  return (
    <>
      <InputField label={'Client ID'} value={reqBody?.client_id} />
      <InputField label={'Client Secret'} value={reqBody?.client_secret} />
      <InputField label={'Audience'} value={reqBody?.audience} />
      <InputField label={'Grant type'} value={reqBody?.grant_type} />
    </>
  );
};

export default TenantConfigData;
