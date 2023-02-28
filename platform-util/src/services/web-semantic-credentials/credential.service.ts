import { IAuth } from '@/dto/setup';
import { CreateCredentialArgs } from '@/dto/web-semantic-credentials/credentials';

const createCredential = (auth: IAuth) => async (args: CreateCredentialArgs): Promise<string> => {
  const resp = await fetch(`${auth.baseUrl}/core/v1/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.authToken}`,
    },
    body: JSON.stringify(args.body),
  });
  return await resp.json();
};

const retrieveCredentials = (auth: IAuth) => async (args) => {
  let url: string;
    switch (args) {
      case undefined:
        url = `${auth.baseUrl}/core/v1/credentials`;
      default:
        const query = new URLSearchParams({
          limit: args ? args?.query.pagination.limit.toString() : '1000',
          cursor: args ? args?.query.pagination.cursor : '',
        }).toString();
        url = `${auth.baseUrl}/core/v1/credentials?${query}`;
    }
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${auth.authToken}`,
      },
    });
    return await resp.json();
};

const retrieveCredential = (auth: IAuth) => async () => {
  return { auth };
};

const removeCredential = (auth: IAuth) => async () => {
  return { auth };
};

const verifyCredential = (auth: IAuth) => async () => {
  return { auth };
};

export const CredentialService = (auth: IAuth) => {
  return {
    createCredential: createCredential(auth),
    retrieveCredentials: retrieveCredentials(auth),
    retrieveCredential: retrieveCredential(auth),
    removeCredential: removeCredential(auth),
    verifyCredential: verifyCredential(auth),
  };
};
