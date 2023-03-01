import {
  CreateDidArgs,
  CreateDidReqResponse,
  RetrieveDidsArgs,
  RetrieveDidsReqResponse,
  ResolveDidArgs,
  ResolveDidReqResponse,
  DeleteDidArgs,
  WellKnownDidConfigResponse,
} from '@/dto/platform-core/dids';
import { IAuth } from '@/dto/setup';
import fetch from 'node-fetch';

const createDid =
  (auth: IAuth) => async (args: CreateDidArgs): Promise<CreateDidReqResponse> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/dids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.authToken}`,
      },
      body: JSON.stringify(args.body),
    });
    return await resp.json();
  };

const retrieveDids =
  (auth: IAuth) => async (args?: RetrieveDidsArgs): Promise<RetrieveDidsReqResponse> => {
    let url: string;
    switch (args) {
      case undefined:
        url = `${auth.baseUrl}/core/v1/dids`;
      default:
        const query = new URLSearchParams({
          limit: args ? args?.query.pagination.limit.toString() : '1000',
          cursor: args ? args?.query.pagination.cursor : '',
        }).toString();
        url = `${auth.baseUrl}/core/v1/dids?${query}`;
    }
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${auth.authToken}`,
      },
    });

    return await resp.json();
  };

const resolveDid =
  (auth: IAuth) => async (args: ResolveDidArgs): Promise<ResolveDidReqResponse> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/dids/${args.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${auth.authToken}`,
      },
    });
    return await resp.json();
  };

const deleteDid =
  (auth: IAuth) => async (args: DeleteDidArgs): Promise<void> => {
    const resp = await fetch(`${auth.baseUrl}/core/v1/dids/${args.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${auth.authToken}`,
      },
    });
    return await resp.json();
  };

const wellKnownDidConfiguration = async (
  auth: IAuth,
): Promise<WellKnownDidConfigResponse> => {
  const resp = await fetch(`${auth.baseUrl}/.well-known/did-configuration`, {
    method: 'GET',
  });

  return await resp.json();
};

export const DidService = (auth: IAuth) => {
  return {
    createDid: createDid(auth),
    retrieveDids: retrieveDids(auth),
    resolveDid: resolveDid(auth),
    deleteDid: deleteDid(auth),
    wellKnownDidConfiguration: wellKnownDidConfiguration(auth),
  };
};
