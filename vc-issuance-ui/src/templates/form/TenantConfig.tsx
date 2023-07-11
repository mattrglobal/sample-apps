/* eslint-disable @typescript-eslint/no-misused-promises */
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type CreateAuthTokenArgs,
  createAuthTokenArgsSchema,
} from "@/types/create-auth-token";
import { api } from "@/utils/api";
import { Button } from "@material-tailwind/react";
import { Alert } from "@material-tailwind/react";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { Input } from "@material-tailwind/react";
import Feedback from "@/components/Feedback";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { IssuanceSliceActions } from "@/store/issuance.slice";
import { type RootState } from "@/store/store";
import InputFieldLabel from "@/components/InputFieldLabel";

const TenantConfig = () => {
  const { config } = useSelector((state: RootState) => state.issuanceReducer);
  const [tenantDomain, setTenantDomain] = useState(
    `tenant_subdomain.vii.mattr.global`
  );
  const { register, handleSubmit, formState, getValues } =
    useForm<CreateAuthTokenArgs>({
      resolver: zodResolver(createAuthTokenArgsSchema),
    });

  const [openModal, setOpenModal] = useState(true);

  const mutation = api.coreRoutes.createAuthToken.useMutation();
  const onSubmit: SubmitHandler<CreateAuthTokenArgs> = async (data) => {
    console.log(data);
    await mutation.mutateAsync(data);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (mutation.data !== undefined && mutation.isSuccess) {
      console.log(`DISPATCHING - IssuanceSliceActions`);
      dispatch(
        IssuanceSliceActions.update({
          config: {
            createAuthToken: {
              reqBody: getValues("body"),
              resBody: mutation.data,
            },
            tenantDomain,
            completed: true,
          },
        })
      );
    }
  }, [mutation.isSuccess, mutation.data, dispatch, getValues, tenantDomain]);

  const buttonDisabled =
    !formState.isDirty ||
    !formState.isValid ||
    formState.isSubmitting ||
    mutation.isLoading ||
    mutation.isSuccess;

  return (
    <div className="w-full space-y-4 p-6 sm:p-8 md:space-y-6">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
        Tenant Configuration
      </h1>
      <form
        className="w-full space-y-4 md:space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <InputFieldLabel show={mutation.isSuccess} label={"Client ID"} />
          <Input
            label="MATTR Client ID"
            {...register("body.client_id")}
            required
            value={
              config?.createAuthToken?.reqBody?.client_id &&
              config?.createAuthToken?.reqBody?.client_id
            }
            disabled={
              mutation.isSuccess ||
              config?.createAuthToken?.reqBody?.client_id !== undefined
            }
            error={formState.errors.body?.client_id !== undefined}
          />
          <Feedback
            textColor="text-red-600"
            message={formState.errors.body?.client_id?.message as string}
            display={true}
          />
        </div>
        <div>
          <InputFieldLabel show={mutation.isSuccess} label={"Client Secret"} />
          <Input
            label="MATTR Client Secret"
            required
            {...register("body.client_secret")}
            value={
              config?.createAuthToken?.reqBody?.client_secret &&
              config?.createAuthToken?.reqBody?.client_secret
            }
            disabled={
              mutation.isSuccess ||
              config?.createAuthToken?.reqBody?.client_secret !== undefined
            }
            error={formState.errors.body?.client_secret !== undefined}
          />
          <Feedback
            textColor="text-red-600"
            message={formState.errors.body?.client_secret?.message as string}
            display={true}
          />
        </div>
        <div>
          <InputFieldLabel show={mutation.isSuccess} label={"Tenant Domain"} />
          <Input
            label="MATTR Tenant Domain"
            required
            disabled={mutation.isSuccess || config?.tenantDomain !== undefined}
            value={tenantDomain}
            placeholder={tenantDomain}
            onChange={(e) => {
              setTenantDomain(e.target.value);
            }}
          />
        </div>
        <div>
          <InputFieldLabel show={mutation.isSuccess} label={"Audience"} />
          <Input
            label="Audience"
            required
            disabled={
              mutation.isSuccess ||
              config?.createAuthToken?.reqBody?.audience !== undefined
            }
            value={"https://vii.mattr.global"}
            {...register("body.audience")}
          />
        </div>
        <div>
          <InputFieldLabel show={mutation.isSuccess} label={"Grant Type"} />
          <Input
            label="Grant type"
            required
            disabled={
              mutation.isSuccess ||
              config?.createAuthToken?.reqBody?.grant_type !== undefined
            }
            value={"client_credentials"}
            {...register("body.grant_type")}
          />
        </div>
        <div>
          <InputFieldLabel show={mutation.isSuccess} label={"Auth Token"} />
          <Input
            label="Auth Token"
            disabled
            value={config?.createAuthToken?.resBody?.access_token}
          />
        </div>
        <Button
          type="submit"
          fullWidth
          disabled={buttonDisabled}
          className="bg-primary-600"
        >
          Validate tenant
        </Button>
        <Alert
          color="yellow"
          open={mutation.isLoading}
          icon={<ArrowPathIcon strokeWidth={2} className="h-6 w-6" />}
        >
          Validating tenant configuration
        </Alert>
        <Alert
          color="red"
          open={mutation.isError && openModal}
          onClose={() => setOpenModal(false)}
          icon={<XCircleIcon strokeWidth={2} className="h-6 w-6" />}
        >
          {`Tenant validation failed. Error: ${
            mutation.error?.message as string
          }`}
        </Alert>
        <Alert
          color="green"
          open={mutation.isSuccess && openModal}
          onClose={() => setOpenModal(false)}
          icon={<CheckCircleIcon strokeWidth={2} className="h-6 w-6" />}
        >
          Tenant validation completed!
        </Alert>
      </form>
    </div>
  );
};

export default TenantConfig;
