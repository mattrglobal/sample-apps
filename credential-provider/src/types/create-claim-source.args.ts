export type CreateClaimSourceArgs = {
  token: string;
  body: CreateClaimSourceReqBody;
};

export type CreateClaimSourceReqBody = {
  name: string;
  url: string;
  authorization: {
    type: string;
    value: string;
  };
  requestParameters: Record<string, RequestParameter>;
};

export type RequestParameter = {
  mapFrom: string;
  defaultValue: string;
};
