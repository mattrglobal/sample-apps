import { type MattrConfig, mattrConfigSchema } from "@/types/common";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { type FC } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

const PresentationRequestForm: FC = () => {
  const { register, handleSubmit } = useForm<MattrConfig>({
    resolver: zodResolver(mattrConfigSchema),
  });

  const mutation = api.coreRoutes.createPresentationRequestQueryByExample.useMutation()

  const onSubmit: SubmitHandler<MattrConfig> = async (data) => {
    console.log(JSON.stringify(data));
    await mutation.mutateAsync(data)
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
        <button type="submit">Generate QR code</button>
      </form>
    </div>
  );
};

export default PresentationRequestForm;
