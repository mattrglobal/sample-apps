import { IAuth } from '@/dto/setup';

const setRevocationStatus = (auth: IAuth) => async () => {
  return auth;
};

const retrieveRevocationStatus = (auth: IAuth) => async () => {
  return auth;
};

const retrieveRevocationList = (auth: IAuth) => async () => {
  return auth;
};

const createRevocationMessagePayload = (auth: IAuth) => async () => {
  return auth;
};

export const RevocationService = (auth: IAuth) => {
  return {
    setRevocationStatus: setRevocationStatus(auth),
    retrieveRevocationStatus: retrieveRevocationStatus(auth),
    retrieveRevocationList: retrieveRevocationList(auth),
    createRevocationMessagePayload: createRevocationMessagePayload(auth),
  };
};
