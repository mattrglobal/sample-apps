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
  type CreatePresentationTemplateResBody,
  type RetrievePresentationTemplatesRes,
  retrievePresentationTemplatesResSchema,
} from "@/types/presentation";
import { type MattrConfig } from "@/types/common";
import { type RetrieveDidsResBody } from "@/types/retrieve-dids";
import {
  type CustomDomain,
  customDomainSchema,
} from "@/types/retrieve-custom-domain";
import { type CreateDidArgs } from "@/types/create-did";
import {
  DID_KEY_Ed25519_SCHEMA,
  type DID_KEY_Ed25519,
} from "@/types/did-document";
import { type SignMessageArgs } from "@/types/sign-message";

/**
 * Endpoint - GET /core/v1/dids
 */
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

/**
 * Endpoint - GET /core/v1/config/domain
 */
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

/**
 * Endpoint - POST /core/v1/dids
 * - NOTE: This function currently only supports creating did:key where keyType is Ed25519
 * - Please modify this function or create new ones if you wish to create DID of other methods and types
 */
export const createDid = async (
  args: CreateDidArgs
): Promise<AxiosResponse<DID_KEY_Ed25519>> => {
  const url = `https://${args.config.tenantDomain}/core/v1/dids`;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const data = args.body;
  const res = await axios.post(url, data, config).then((res) => ({
    ...res,
    data: DID_KEY_Ed25519_SCHEMA.parse(res.data),
  }));
  return res;
};

/**
 * Endpoint - POST /v2/credentials/web-semantic/sign
 */
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

/**
 * Endpoint - POST /core/v1/messaging/sign
 */
export const signMessage = async (args: SignMessageArgs) => {
  const url = `https://${args.config.tenantDomain}/core/v1/messaging/sign`;
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

/**
 * Endpoint - POST /core/v1/messaging/encrypt
 */
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

/**
 * Endpoint - POST /core/v1/messaging/send
 */
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

/**
 * Endpoint - GET /v2/credentials/web-semantic/presentations/templates
 */
export const retrievePresentationTemplates = async (
  args: MattrConfig
): Promise<AxiosResponse<RetrievePresentationTemplatesRes>> => {
  const url = `https://${args.tenantDomain}/v2/credentials/web-semantic/presentations/templates`;
  const config = CommonService.buildAxiosConfig(args.token);
  const res = await axios
    .post(url, config)
    .then((res) => ({
      ...res,
      data: retrievePresentationTemplatesResSchema.parse(res.data),
    }))
    .catch((e: AxiosError) => {
      throw e.response?.data;
    });
  return res;
};

/**
 * Endpoint - POST /v2/credentials/web-semantic/presentations/templates
 */
export const createPresentationTemplate = async (
  args: CreatePresentationTemplateArgs
): Promise<AxiosResponse<CreatePresentationTemplateResBody>> => {
  const url = `https://${args.config.tenantDomain}/v2/credentials/web-semantic/presentations/templates`;
  const data = args.body;
  console.log(`body -> ${JSON.stringify(data)}`);
  const config = CommonService.buildAxiosConfig(args.config.token);
  const res = await axios
    .post(url, data, config)
    .then((res) => ({
      ...res,
      // data: createPresentationTemplateResBodySchema.parse(res.data),
    }))
    .catch((e: AxiosError) => {
      throw e.response?.data;
    });
  return res;
};

/**
 * Endpoint - POST /v2/credentials/web-semantic/presentations/requests
 */
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
