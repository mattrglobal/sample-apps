import { IAuth } from '@/dto/setup';
import { CreateCredentialArgs } from '@/dto/web-semantic-credentials/credentials';

const createCredential = (auth: IAuth) => async (args: CreateCredentialArgs) => {
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

const retrieveCredentials = (auth: IAuth) => async () => {
  return { auth };
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
