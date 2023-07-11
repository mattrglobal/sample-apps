import { api } from "@/utils/api";
import { Select, Option, Button, Alert } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import { useState } from "react";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { IssuanceSliceActions } from "@/store/issuance.slice";
import { type DidDocument } from "@/types/did-document";

const IssuerPicker = () => {
  const state = useSelector((state: RootState) => state.issuanceReducer);
  const { config } = state;
  const mutation = api.coreRoutes.retrieveDids.useMutation();
  const [openModal, setOpenModal] = useState(true);
  const dispatch = useDispatch();

  const disableIssuerGetterBtn =
    !state.config?.tenantDomain ||
    !state.config.createAuthToken?.resBody?.access_token;

  return (
    <div className="w-full space-y-4 p-6 sm:p-8 md:space-y-6">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
        Pick an issuer
      </h1>
      <form className="w-full space-y-4 md:space-y-6">
        <div className="py-4">
          {mutation.data && (
            <Select
              label="Select Issuer"
              animate={{
                mount: { y: 0 },
                unmount: { y: 25 },
              }}
              onChange={(e) => {
                const didDocument = JSON.parse(e as string) as DidDocument;
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                console.log(`onChange - ${e}`);
                dispatch(
                  IssuanceSliceActions.update({
                    issuerSelection: {
                      issuer: didDocument,
                      completed: true,
                    },
                  })
                );
              }}
            >
              {mutation.data?.data.map((d, i) => (
                <Option
                  key={i}
                  value={JSON.stringify(d)}
                  disabled={!d.did.includes("did:key")}
                >
                  {d.did}
                </Option>
              ))}
            </Select>
          )}
          <Button
            className="my-3"
            fullWidth
            disabled={disableIssuerGetterBtn}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={() =>
              mutation.mutateAsync({
                config: {
                  token: config?.createAuthToken?.resBody
                    ?.access_token as string,
                  tenantDomain: config?.tenantDomain as string,
                },
              })
            }
          >
            {!mutation.data && "Get issuers"}
            {mutation.data && "Get issuers again"}
          </Button>
          <Alert
            color="yellow"
            open={mutation.isLoading}
            icon={<ArrowPathIcon strokeWidth={2} className="h-6 w-6" />}
          >
            Fetching DIDs
          </Alert>
          <Alert
            color="green"
            open={mutation.isSuccess && openModal}
            onClose={() => setOpenModal(false)}
            icon={<CheckCircleIcon strokeWidth={2} className="h-6 w-6" />}
          >
            {`We've got your DIDs!`}
          </Alert>
          <Alert color="red" open={mutation.isError && openModal}>
            Failed to fetch DIDs. Error: $
            {JSON.stringify(mutation.error?.message)}
          </Alert>
        </div>
      </form>
    </div>
  );
};

export default IssuerPicker;
