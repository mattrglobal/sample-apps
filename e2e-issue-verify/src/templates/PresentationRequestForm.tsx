import { env } from "@/env.mjs";
import { type MattrConfig, mattrConfigSchema } from "@/types/common";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { type FC } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import QRCode from "react-qr-code";

/**
 * Step 1: Create PresentationRequest
 * Step 2: Render QR code + start countdown timer + start fetching PresentationRequest.response
 * Step 3: Stop all of step 2 once PresentationRequest.response is non-empty
 * Step 4: Display PresentationRequest.response, show reset button
 * Step 5: Revert UI back to prior to step 1
 */
const PresentationRequestForm: FC = () => {
  const { register, handleSubmit, getValues } = useForm<MattrConfig>({
    resolver: zodResolver(mattrConfigSchema),
  });

  const mutation =
    api.coreRoutes.createPresentationRequestQueryByExample.useMutation();

  const onSubmit: SubmitHandler<MattrConfig> = async (data) => {
    console.log(JSON.stringify(data));
    await mutation.mutateAsync(data);
  };

  return (
    <div>
      <h1>PresentationRequest</h1>
      <form
        className="TODO_LATER"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="auth-token">
          <label htmlFor="auth-token">Auth token</label>
          <input type="text" id="auth-token" {...register("token")} />
        </div>
        <div className="tenant-domain">
          <label htmlFor="tenant-domain">Tenant Domain</label>
          <input type="text" id="tenant-domain" {...register("tenantDomain")} />
        </div>
        <button type="submit">
          {mutation.isLoading ? "Generating QR code..." : "Generate QR code"}
        </button>
      </form>
      {mutation.isSuccess && mutation.data.signedJws && (
        <QRCode
          className="w-full content-center items-center"
          value={`didcomm://${env.NEXT_PUBLIC_APP_URL}/api/redirect/${
            mutation.data.id
          }?tenantDomain=${getValues("tenantDomain")}`}
        />
      )}
    </div>
  );
};

export default PresentationRequestForm;
