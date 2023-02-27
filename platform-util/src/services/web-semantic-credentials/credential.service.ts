import { IAuth } from '@/dto/setup';

const createCredential = (auth: IAuth) => async () => {
  return { auth };
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
