import { env } from "@/env.mjs";
import { type MattrConfig, mattrConfigSchema } from "@/types/common";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@material-tailwind/react";
import React, { useEffect, useState, type FC } from "react";
import Countdown from "react-countdown";
import { type SubmitHandler, useForm } from "react-hook-form";
import QRCode from "react-qr-code";

type RendererProps = {
  minutes: number;
  seconds: number;
};
const renderer = (props: RendererProps) => (
  <span>
    {props.minutes} minutes and {props.seconds} seconds
  </span>
);

enum PresentationRequestStage {
  NO_QR_CODE = "No QR code",
  FETCHING_QR_COD = "Fetching QR code",
  DISPLAY_QR_CODE = "Displaying QR code",
  GOT_PRESENTATION_RESPONSE = "Got presentation response",
}

/**
 * Component for verifying verifiable credentials via QR code
 *
 * Actions:
 * 1. Trigger event to create PresentationRequest on server-side
 * 2. Render QR code + start countdown timer + start fetching PresentationRequest.response (long-polling)
 * 3. (VERY IMPORTANT): Stop all of step 2 once PresentationRequest.response is non-empty
 * 4. Render & display PresentationRequest.response
 * 5. Show button for reverting the UI back to step 1 (optional)
 */
const PresentationRequestForm: FC = () => {
  const [stage, setStage] = useState<PresentationRequestStage>(
    PresentationRequestStage.NO_QR_CODE
  );
  const [lastCheckedPresentationResponse, SetLastCheckedPresentationResponse] =
    useState(new Date());
  const { register, handleSubmit, getValues, formState } = useForm<MattrConfig>(
    {
      resolver: zodResolver(mattrConfigSchema),
    }
  );

  const mutation =
    api.coreRoutes.createPresentationRequestQueryByExample.useMutation();

  const onSubmit: SubmitHandler<MattrConfig> = async (data) => {
    await mutation.mutateAsync(data);
  };

  // Query for PresentationRequest.response every 5 minutes + update UI accordingly
  const QUERY_PRESENTATION_RESPONSE =
    api.coreRoutes.getPresentationResponse.useMutation();

  /**
   * Setting stage to be DISPLAY_QR_CODE once a PresentationRequest.id returned from the API
   */
  useEffect(() => {
    if (mutation.data?.id || mutation.isSuccess) {
      setStage(PresentationRequestStage.DISPLAY_QR_CODE);
    }
  }, [mutation.data?.id, mutation.isSuccess]);

  /**
   * Handler responsible for updating the stage of the page depends on API response
   *
   * - If the stage is DISPLAY_QR_CODE, keep the interval going
   * - As soon as data.response from QUERY_PRESENTATION_RESPONSE is a string, not null or undefined, then we can update the stage to be GOT_PRESENTATION_RESPONSE
   */
  useEffect(() => {
    if (stage === PresentationRequestStage.DISPLAY_QR_CODE) {
      console.log(`DISPLAY_QR_CODE`);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      const interval = setInterval(async () => {
        SetLastCheckedPresentationResponse(new Date());
        const { mutateAsync, data } = QUERY_PRESENTATION_RESPONSE;
        await mutateAsync({
          id: mutation.data?.id as string,
        });
        if (typeof data?.response === "string") {
          const json = JSON.stringify(data?.response);
          console.log(`Response -> ${json}`);
          setStage(PresentationRequestStage.GOT_PRESENTATION_RESPONSE);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [QUERY_PRESENTATION_RESPONSE, mutation.data?.id, stage]);

  const now = new Date();
  let qrCodeExpiresAt = new Date();
  if (mutation.data?.expiresAt) {
    qrCodeExpiresAt = new Date(Number(BigInt(mutation.data.expiresAt)));
  }

  return (
    <div>
      <h1>Generate Presentation Request</h1>
      <form
        className="TODO_LATER"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
      >
        <div id="auth-token" className="mb-5">
          <label htmlFor="auth-token">Auth token</label>
          <input
            type="text"
            id="auth-token"
            {...register("token")}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
          {formState.errors.token && (
            <span className="mt-2 block text-red-800">
              {formState.errors.token.message}
            </span>
          )}
        </div>
        <div id="tenant-domain" className="mb-5">
          <label htmlFor="tenant-domain">Tenant Domain</label>
          <input
            type="text"
            id="tenant-domain"
            {...register("tenantDomain")}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          />
          {formState.errors.tenantDomain && (
            <span className="mt-2 block text-red-800">
              {formState.errors.tenantDomain.message}
            </span>
          )}
        </div>
        <Button type="submit" className="bg-blue-500">
          {mutation.isLoading ? "Generating QR code..." : "Generate QR code"}
        </Button>
      </form>
      {mutation.isSuccess &&
        mutation.data.signedJws &&
        typeof QUERY_PRESENTATION_RESPONSE.data?.response !== "string" && (
          <div className="w-full content-center items-center text-center">
            <QRCode
              className="mb-4 w-full content-center items-center"
              // This URL tells MATTR Wallet to visit the API route at /pages/api/redirect/[id].ts
              // So that MATTR Wallet can have access to the signed PresentationRequest without taking too long scanning the QR code
              value={`didcomm://${env.NEXT_PUBLIC_APP_URL}/api/redirect/${
                mutation.data.id
              }?tenantDomain=${getValues("tenantDomain")}`}
            />
            {/* Notify people if QR code expired */}
            {now >= qrCodeExpiresAt && <p>{`QR Code expired!`}</p>}
            {/* Notify people how long they have until QR code expires */}
            {now < qrCodeExpiresAt && (
              <p>
                You have{" "}
                <strong>
                  <Countdown
                    date={Number(BigInt(mutation.data?.expiresAt))}
                    renderer={renderer}
                  />
                </strong>{" "}
                until this QR code expires
              </p>
            )}
            <p>
              Last checked presentation response @{" "}
              <strong>
                {lastCheckedPresentationResponse.toISOString().slice(0, 10)},
                {lastCheckedPresentationResponse.toLocaleTimeString()} -{" "}
                {Intl.DateTimeFormat().resolvedOptions().timeZone}{" "}
              </strong>
            </p>
          </div>
        )}
      {mutation.isError && (
        <p>Failed to generate QR code! Error: {mutation.error.message}</p>
      )}
      {QUERY_PRESENTATION_RESPONSE.data?.response && (
        <div className="w-full content-center items-center px-25 py-10 text-left">
          <p>
            <strong>{`Presentation response (claims): `}</strong>
            {QUERY_PRESENTATION_RESPONSE.data?.response}
          </p>
        </div>
      )}
    </div>
  );
};

export default PresentationRequestForm;
