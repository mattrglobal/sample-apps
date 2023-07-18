import {
  type IssueStaticCredentialArgs,
  issueStaticCredentialArgsSchema,
} from "@/types/issue-static-credential";
import React from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";

const IssueCredentialForm = () => {
  const { register, handleSubmit, formState } =
    useForm<IssueStaticCredentialArgs>({
      resolver: zodResolver(issueStaticCredentialArgsSchema),
    });

  const onSubmit: SubmitHandler<IssueStaticCredentialArgs> = (data) => {
    console.log(data);
    mutation.mutate(data);
  };

  const mutation = api.coreRoutes.issueStaticCredential.useMutation();
  return (
    <section className="w-full bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0">
        <div className="w-full rounded-lg bg-white shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0">
          <div className="space-y-4 p-6 sm:p-8 md:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
              Issuing yourself a credential
            </h1>
            <form
              className="w-full space-y-4 md:space-y-6"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                {/* wallet did */}
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your Public Wallet DID
                </label>
                <input
                  type="text"
                  id="wallet-did"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 sm:text-sm"
                  placeholder="did:key:something"
                  {...register("walletDid")}
                />
                {formState.errors.walletDid && (
                  <span className="mt-2 block text-red-800">
                    {formState.errors.walletDid.message}
                  </span>
                )}
              </div>
              <div>
                {/* tenant */}
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your MATTR Tenant Domain
                </label>
                <input
                  type="text"
                  id="tenant-domain"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 sm:text-sm"
                  placeholder="your-tenant-subdomain.vii.mattr.global"
                  {...register("config.tenantDomain")}
                />
                {formState.errors.config?.tenantDomain && (
                  <span className="mt-2 block text-red-800">
                    {formState.errors.config.tenantDomain.message}
                  </span>
                )}
              </div>
              <div>
                {/* token */}
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your MATTR Auth Token
                </label>
                <input
                  type="text"
                  id="mattr-auth-token"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 sm:text-sm"
                  {...register("config.token")}
                />
                {formState.errors.config?.token && (
                  <span className="mt-2 block text-red-800">
                    {formState.errors.config.token.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={formState.isSubmitting || mutation.isLoading}
                className="disabled:bg-slate-500 w-full rounded-lg bg-primary-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                {formState.isSubmitting || mutation.isLoading
                  ? "Issuing Credental..."
                  : "Issue Credential"}
              </button>
              {mutation.data?.success === false && (
                <span className="mt-2 block text-red-600">
                  Error: {mutation.data?.status}
                </span>
              )}
              {mutation.isSuccess && mutation.data.success && (
                <span className="mt-2 block text-green-600">
                  {`Credential issued! Please check your MATTR wallet. `}
                </span>
              )}
              {mutation.isError && (
                <span className="mt-2 block text-red-800">
                  Credential issuance failed. Error: {mutation.error.message}
                </span>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IssueCredentialForm;
