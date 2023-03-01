export interface GetWebhookJwksReqResponse {
  keys: Key[];
};

interface Key {
  kty: string;
  crv: string;
  x: string;
  use: string;
  kid: string;
};
