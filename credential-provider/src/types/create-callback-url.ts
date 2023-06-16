import { JWTVerifyResult } from 'jose';

export type CreateCallbackUrlArgs = {
  session_token: string;
};

export type VerifyInteractionHookTokenArgs = {
  session_token: string;
  secret: Buffer;
};

export type CreateInteractionHookResponseTokenArgs = {
  session_token: string;
  verifiedJwt: JWTVerifyResult;
  secret: Buffer;
};

export type ResponseTokenPayload<State = any, Claims = any> = {
  state: State;
  claims: Claims;
};
