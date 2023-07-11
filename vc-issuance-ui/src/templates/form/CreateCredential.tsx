/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  type SubmitHandler,
  useForm,
  type SubmitErrorHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/utils/api";
import { Alert, Button } from "@material-tailwind/react";
import { Input } from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { IssuanceSliceActions } from "@/store/issuance.slice";
import { type RootState } from "@/store/store";
import {
  type CreateCredentialReqBodyPayload,
  type CreateCredentialReqBody,
  createCredentialReqBodySchema,
} from "@/types/create-credential";
import { useEffect, useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { type EncryptMessageReqBody } from "@/types/encrypt-message";
import { v4 as uuidv4 } from "uuid";
import { type SendMessageReqBody } from "@/types/send-message";

enum ISSUANCE_STAGE {
  NOT_STARTED,
  CREATE_CREDENTIAL_LOADING = "Creating credential",
  CREATE_CREDENTIAL_SUCCESS = "Credental created",
  CREATE_CREDENTIAL_FAILED = "Failed to create credential",
  MESSAGE_ENCRYPT_LOADING = "Encrypting credential",
  MESSAGE_ENCRYPT_SUCCESS = "Credental encrypted",
  MESSAGE_ENCRYPT_FAILED = "Failed to encrypt credential",
  MESSAGE_SEND_LOADING = "Sending credential to wallet",
  MESSAGE_SEND_SUCCESS = "Credental sent to wallet",
  MESSAGE_SEND_FAILED = "Failed to send credential",
}

type Claim = {
  key: string;
  value: string | number | boolean | Claim;
};

const CreateCredential = () => {
  const { config, issuerSelection, createCredential } = useSelector(
    (state: RootState) => state.issuanceReducer
  );
  const createCredentialReqBody = createCredential?.reqBody;
  const issuerDid = issuerSelection?.issuer?.did as string;
  const { register, handleSubmit, getValues, setValue } =
    useForm<CreateCredentialReqBody>({
      resolver: zodResolver(createCredentialReqBodySchema),
    });

  useEffect(() => {
    setValue("payload.issuer.id", issuerDid);
    setValue("payload.type", ["PlaceHolderCredential"]);
  }, [issuerDid, setValue]);

  const [claims, setClaims] = useState<Claim[]>([]);

  const dispatch = useDispatch();
  const [issuing, setIssuing] = useState(false);
  const [openModal, setOpenModal] = useState(true);
  const [currStage, setCurrStage] = useState<ISSUANCE_STAGE>(
    ISSUANCE_STAGE.NOT_STARTED
  );

  const createCredentialMutation =
    api.coreRoutes.createCredential.useMutation();
  const encryptMessagelMutation = api.coreRoutes.encryptMessage.useMutation();
  const sendMessagelMutation = api.coreRoutes.sendMessage.useMutation();

  const onSubmit: SubmitHandler<CreateCredentialReqBody> = async (data) => {
    console.log(data);
    setIssuing(true);
    const configData = {
      token: config?.createAuthToken?.resBody?.access_token as string,
      tenantDomain: config?.tenantDomain as string,
    };
    try {
      setCurrStage(ISSUANCE_STAGE.CREATE_CREDENTIAL_LOADING);
      await createCredentialMutation
        .mutateAsync({
          config: configData,
          body: getValues(),
        })
        .then(async (res) => {
          setCurrStage(ISSUANCE_STAGE.CREATE_CREDENTIAL_SUCCESS);
          const keyAgreement = issuerSelection?.issuer?.localMetadata
            .initialDidDocument.keyAgreement as Array<{ id: string }>;
          const issuerDid = issuerSelection?.issuer?.did as string;
          const senderDidUrl = keyAgreement[0]?.id as string;
          const walletDid = createCredential?.reqBody?.payload.credentialSubject
            .id as string;
          const credential = res.credential as unknown;
          const domain = config?.tenantDomain as string;
          const body: EncryptMessageReqBody = {
            senderDidUrl,
            recipientDidUrls: [walletDid],
            payload: {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
              id: uuidv4(),
              type: "https://mattr.global/schemas/verifiable-credential/offer/Direct",
              from: issuerDid,
              to: [walletDid],
              created_time: Date.now(),
              body: { credentials: [credential], domain },
            },
          };
          setCurrStage(ISSUANCE_STAGE.MESSAGE_ENCRYPT_LOADING);
          await encryptMessagelMutation
            .mutateAsync({
              config: configData,
              body,
            })
            .then(async (res) => {
              setCurrStage(ISSUANCE_STAGE.MESSAGE_ENCRYPT_SUCCESS);
              const message = res.jwe as unknown;
              const body: SendMessageReqBody = {
                to: walletDid,
                message,
              };
              await sendMessagelMutation
                .mutateAsync({
                  config: configData,
                  body,
                })
                .then(() => {
                  setIssuing(false);
                  setCurrStage(ISSUANCE_STAGE.MESSAGE_SEND_SUCCESS);
                })
                .catch(() => {
                  setIssuing(false);
                  setCurrStage(ISSUANCE_STAGE.MESSAGE_SEND_FAILED);
                });
            })
            .catch(() => {
              setIssuing(false);
              setCurrStage(ISSUANCE_STAGE.MESSAGE_ENCRYPT_FAILED);
            });
        })
        .catch(() => {
          setIssuing(false);
          setCurrStage(ISSUANCE_STAGE.CREATE_CREDENTIAL_FAILED);
        });
    } catch (e) {
      throw e;
    }
  };

  const onInvalid: SubmitErrorHandler<CreateCredentialReqBody> = (errors) => {
    console.log(errors);
  };

  const payload =
    createCredentialReqBody?.payload as CreateCredentialReqBodyPayload;
  const currCredentialSubject = payload.credentialSubject;

  const disableForm =
    createCredentialMutation.isLoading ||
    encryptMessagelMutation.isLoading ||
    sendMessagelMutation.isLoading;

  return (
    <div className="w-full space-y-4 p-6 sm:p-8 md:space-y-6">
      <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
        Issue Credential
      </h1>
      <form
        className="w-full space-y-4 md:space-y-6"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
      >
        <div>
          <Input
            label="Name"
            {...register("payload.name")}
            required
            disabled={disableForm}
            onChange={(e) => {
              dispatch(
                IssuanceSliceActions.update({
                  createCredential: {
                    reqBody: {
                      payload: {
                        ...payload,
                        name: e.target.value,
                      },
                    },
                  },
                })
              );
            }}
          />
        </div>
        <div>
          <Input
            label="Description"
            disabled={disableForm}
            {...register("payload.description")}
            onChange={(e) => {
              dispatch(
                IssuanceSliceActions.update({
                  createCredential: {
                    reqBody: {
                      payload: {
                        ...payload,
                        description: e.target.value,
                      },
                    },
                  },
                })
              );
            }}
          />
        </div>
        <h2 className="text-l leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
          Issuer details
        </h2>
        <div>
          <Input label="Issuer DID" value={issuerDid} success disabled />
        </div>
        <div>
          <Input
            label="Issuer name"
            {...register("payload.issuer.name")}
            required
            disabled={disableForm}
            onChange={(e) => {
              dispatch(
                IssuanceSliceActions.update({
                  createCredential: {
                    reqBody: {
                      payload: {
                        ...payload,
                        issuer: {
                          id: issuerSelection?.issuer?.did as string,
                          name: e.target.value,
                        },
                      },
                    },
                  },
                })
              );
            }}
          />
        </div>
        <h2 className="text-l leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl">
          Credential Subjects (claims)
        </h2>
        <div>
          <Input
            label="Wallet DID"
            {...register("payload.credentialSubject.id")}
            required
            disabled={disableForm}
            onChange={(e) => {
              dispatch(
                IssuanceSliceActions.update({
                  createCredential: {
                    reqBody: {
                      payload: {
                        ...payload,
                        credentialSubject: {
                          ...currCredentialSubject,
                          id: e.target.value,
                        },
                      },
                    },
                  },
                })
              );
            }}
          />
        </div>
        <div>
          {claims.map((d, i) => (
            <div key={i} className="flex items-center gap-2 py-1 align-middle">
              <Input
                label="Key"
                onChange={(e) => {
                  const key = e.target.value;
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  const newClaim = Object.assign({
                    // ...currCredentialSubject,
                    [key]: "",
                  });
                  claims[i] = {
                    key,
                    value: "",
                  };
                  console.log(
                    `claims[${JSON.stringify(i)}].key = ${
                      claims[i]?.key as string
                    }`
                  );
                  dispatch(
                    IssuanceSliceActions.update({
                      createCredential: {
                        reqBody: {
                          payload: {
                            ...payload,
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            credentialSubject: {
                              id: currCredentialSubject.id,
                              ...newClaim,
                            },
                          },
                        },
                      },
                    })
                  );
                }}
              />
              <Input
                label="Value"
                onChange={(e) => {
                  const value = e.target.value;
                  const claimToChange = claims[i];

                  claims[i] = {
                    key: claimToChange?.key as string,
                    value,
                  };

                  const mappedClaims: {
                    [key: string]: string | number | boolean | Claim;
                  } = {};
                  claims.forEach((d) => {
                    const key = d.key;
                    if (mappedClaims[key] === undefined) {
                      mappedClaims[key] = d.value;
                    }
                  });

                  console.log(
                    `MAPPED_CLAIMS - ${JSON.stringify(mappedClaims)}`
                  );

                  dispatch(
                    IssuanceSliceActions.update({
                      createCredential: {
                        reqBody: {
                          payload: {
                            ...payload,
                            credentialSubject: {
                              id: currCredentialSubject.id,
                              ...mappedClaims,
                            },
                          },
                        },
                      },
                    })
                  );
                }}
              />
              <Button
                onClick={() => {
                  console.log(`deleting ${i}`);
                  const newClaims = claims.filter((d, k) => k !== i);
                  setClaims(newClaims);
                  const claimToDelete = claims[i];
                  console.log(
                    `key to delete: ${JSON.stringify(claimToDelete)}`
                  );
                  dispatch(
                    IssuanceSliceActions.update({
                      createCredential: {
                        reqBody: {
                          payload: {
                            ...payload,
                            credentialSubject: {
                              id: currCredentialSubject.id,
                              ...claims,
                            },
                          },
                        },
                      },
                    })
                  );
                }}
              >
                <TrashIcon strokeWidth={2} className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          className="bg-primary-500"
          onClick={() => {
            const newClaims: Claim[] = [
              ...claims,
              {
                key: "",
                value: "",
              },
            ];
            console.log(`newClaims.len = ${newClaims.length}`);
            setClaims(newClaims);
          }}
        >
          Add claim
        </Button>
        <Button
          type="submit"
          fullWidth
          className="bg-primary-600"
          disabled={disableForm}
        >
          {!issuing && "Issue Credential"}
          {issuing && "Issuing"}
        </Button>
        <Alert
          color="yellow"
          open={
            createCredentialMutation.isLoading ||
            encryptMessagelMutation.isLoading ||
            sendMessagelMutation.isLoading
          }
          icon={<ArrowPathIcon strokeWidth={2} className="h-6 w-6" />}
        >
          {currStage}
        </Alert>
        <Alert
          color="green"
          open={sendMessagelMutation.isSuccess && openModal}
          onClose={() => setOpenModal(false)}
          icon={<CheckCircleIcon strokeWidth={2} className="h-6 w-6" />}
        >
          Credential issued to your wallet!
        </Alert>
      </form>
    </div>
  );
};

export default CreateCredential;
