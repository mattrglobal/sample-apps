import {
  type CreateCredentialArgs,
  type CreateCredentialResBody,
  createCredentialResBodySchema,
} from "@/types/create-credential";
import axios, { type AxiosResponse, type AxiosError } from "axios";
import * as CommonService from "@/services/common.service";
import {
  type EncryptMessageArgs,
  type EncryptMessageResBody,
  encryptMessageResBodySchema,
} from "@/types/encrypt-message";
import {
  type SendMessageArgs,
  type SendMessageReqBody,
} from "@/types/send-message";

export const createCredential = async (
  args: CreateCredentialArgs
): Promise<AxiosResponse<CreateCredentialResBody>> => {
  const url = `${args.config.baseUrl}/v2/credentials/web-semantic/sign`;
  const data = args.body;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const res = await axios
    .post(url, data, config)
    .then((res) => ({
      ...res,
      data: createCredentialResBodySchema.parse(res.data),
    }))
    .catch((e: AxiosError) => {
      throw e.response?.data;
    });
  return res;
};

export const encryptMessage = async (
  args: EncryptMessageArgs
): Promise<AxiosResponse<EncryptMessageResBody>> => {
  const url = `${args.config.baseUrl}/core/v1/messaging/encrypt`;
  const data = args.body;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const res = await axios
    .post(url, data, config)
    .then((res) => ({
      ...res,
      data: encryptMessageResBodySchema.parse(res.data),
    }))
    .catch((e: AxiosError) => {
      throw e.response?.data;
    });
  return res;
};

export const sendMessage = async (
  args: SendMessageArgs
): Promise<AxiosResponse<SendMessageReqBody>> => {
  const url = `${args.config.baseUrl}/core/v1/messaging/send`;
  const data = args.body;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const res = await axios
    .post(url, data, config)
    .then((res) => res)
    .catch((e: AxiosError) => {
      throw e.response?.data;
    });
  return res;
};
