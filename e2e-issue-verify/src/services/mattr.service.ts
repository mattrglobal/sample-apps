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
import {
  type CreatePresentationRequestArgs,
  type CreatePresentationRequestResBody,
  createPresentationRequestResBodySchema,
  type CreatePresentationTemplateArgs,
  createPresentationTemplateResBodySchema,
  type CreatePresentationTemplateResBody,
} from "@/types/presentation";
import { type MattrConfig } from "@/types/common";
import { type RetrieveDidsResBody } from "@/types/retrieve-dids";
import {
  type CustomDomain,
  customDomainSchema,
} from "@/types/retrieve-custom-domain";
import { type CreateDidArgs } from "@/types/create-did";
import { type DidDocument, didDocumentSchema } from "@/types/did-document";

export const retrieveDids = async (
  args: MattrConfig
): Promise<AxiosResponse<RetrieveDidsResBody>> => {
  const url = `https://${args.tenantDomain}/core/v1/dids`;
  const config = CommonService.buildAxiosConfig(args.token);
  const res = await axios
    .get(url, config)
    .then((res) => res)
    .catch((e: AxiosError) => {
      throw e.response?.data;
    });
  return res;
};

export const retrieveCustomDomain = async (
  args: MattrConfig
): Promise<AxiosResponse<CustomDomain>> => {
  const url = `https://${args.tenantDomain}/core/v1/config/domain`;
  const config = CommonService.buildAxiosConfig(args.token);
  const res = await axios
    .get(url, config)
    .then((res) => ({
      ...res,
      data: customDomainSchema.parse(res.data),
    }))
    .catch((e: AxiosError) => {
      throw e.response?.data;
    });
  return res;
};

export const createDid = async (
  args: CreateDidArgs
): Promise<AxiosResponse<DidDocument>> => {
  const url = `https://${args.config.tenantDomain}/core/v1/dids`;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const data = args.body;
  const res = await axios.post(url, data, config).then((res) => ({
    ...res,
    data: didDocumentSchema.parse(res.data),
  }));
  return res;
};

export const createCredential = async (
  args: CreateCredentialArgs
): Promise<AxiosResponse<CreateCredentialResBody>> => {
  const url = `https://${args.config.tenantDomain}/v2/credentials/web-semantic/sign`;
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
  const url = `https://${args.config.tenantDomain}/core/v1/messaging/encrypt`;
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
  const url = `https://${args.config.tenantDomain}/core/v1/messaging/send`;
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

export const createPresentationTemplate = async (
  args: CreatePresentationTemplateArgs
): Promise<AxiosResponse<CreatePresentationTemplateResBody>> => {
  const url = `https://${args.config.tenantDomain}/v2/credentials/web-semantic/presentations/templates`;
  const data = args.body;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const res = await axios
    .post(url, data, config)
    .then((res) => ({
      ...res,
      data: createPresentationTemplateResBodySchema.parse(res.data),
    }))
    .catch((e: AxiosError) => {
      throw e.response?.data;
    });
  return res;
};

export const createPresentationRequest = async (
  args: CreatePresentationRequestArgs
): Promise<AxiosResponse<CreatePresentationRequestResBody>> => {
  const url = `https://${args.config.tenantDomain}/v2/credentials/web-semantic/presentations/requests`;
  const data = args.body;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const res = await axios
    .post(url, data, config)
    .then((res) => ({
      ...res,
      data: createPresentationRequestResBodySchema.parse(res.data),
    }))
    .catch((e: AxiosError) => {
      throw e.response?.data;
    });
  return res;
};
