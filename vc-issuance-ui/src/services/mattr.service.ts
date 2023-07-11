import {
  type CreateAuthTokenResBody,
  createAuthTokenResBodySchema,
  type CreateAuthTokenArgs,
} from "@/types/create-auth-token";
import axios, { type AxiosResponse } from "axios";
import * as CommonService from "@/services/common.service";
import {
  type RetrieveDidsResBody,
  retrieveDidsResBodySchema,
  type RetrieveDidsArgs,
} from "@/types/retrieve-dids";
import { type MattrConfig } from "@/types/common";
import {
  type RetrieveCustomDomainResBody,
  retrieveCustomDomainResBodySchema,
} from "@/types/retrieve-custom-domain";
import {
  type ResolveDidArgs,
  type ResolveDidResBody,
  resolveDidResBodySchema,
} from "@/types/resolve-did";
import { type CreateDidArgs } from "@/types/create-did";
import { type DidDocument, didDocumentSchema } from "@/types/did-document";
import {
  type CreateCredentialArgs,
  type CreateCredentialResBody,
  createCredentialResBodySchema,
} from "@/types/create-credential";
import {
  type EncryptMessageArgs,
  type EncryptMessageResBody,
  encryptMessageResBodySchema,
} from "@/types/encrypt-message";
import { type SendMessageArgs } from "@/types/send-message";

export const createAuthToken = async (
  args: CreateAuthTokenArgs
): Promise<AxiosResponse<CreateAuthTokenResBody>> => {
  const res = await axios.post(args.url, args.body).then((res) => ({
    ...res,
    data: createAuthTokenResBodySchema.parse(res.data),
  }));
  return res;
};

export const retrieveCustomDomain = async (
  args: MattrConfig
): Promise<AxiosResponse<RetrieveCustomDomainResBody>> => {
  const url = `https://${args.tenantDomain}/core/v1/config/domain`;
  const config = CommonService.buildAxiosConfig(args.token);
  const res = await axios.get(url, config).then((res) => ({
    ...res,
    data: retrieveCustomDomainResBodySchema.parse(res.data),
  }));
  return res;
};

export const retrieveDids = async (
  args: RetrieveDidsArgs
): Promise<AxiosResponse<RetrieveDidsResBody>> => {
  const url = `https://${args.config.tenantDomain}/core/v1/dids`;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const res = await axios.get(url, config).then((res) => ({
    ...res,
    data: retrieveDidsResBodySchema.parse(res.data),
  }));
  return res;
};

export const resolveDid = async (
  args: ResolveDidArgs
): Promise<AxiosResponse<ResolveDidResBody>> => {
  const url = `https://${args.config.tenantDomain}/core/v1/dids/${args.query.did}`;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const res = await axios.get(url, config).then((res) => ({
    ...res,
    data: resolveDidResBodySchema.parse(res.data),
  }));
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
  const config = CommonService.buildAxiosConfig(args.config.token);
  const data = args.body;
  const res = await axios.post(url, data, config).then((res) => ({
    ...res,
    data: createCredentialResBodySchema.parse(res.data),
  }));
  return res;
};

export const encryptMessage = async (
  args: EncryptMessageArgs
): Promise<AxiosResponse<EncryptMessageResBody>> => {
  const url = `https://${args.config.tenantDomain}/core/v1/messaging/encrypt`;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const data = args.body;
  const res = await axios.post(url, data, config).then((res) => ({
    ...res,
    data: encryptMessageResBodySchema.parse(res.data),
  }));
  return res;
};

export const sendMessage = async (
  args: SendMessageArgs
): Promise<AxiosResponse> => {
  const url = `https://${args.config.tenantDomain}/core/v1/messaging/send`;
  const config = CommonService.buildAxiosConfig(args.config.token);
  const data = args.body;
  const res = await axios.post(url, data, config).then((res) => res);
  return res;
};
