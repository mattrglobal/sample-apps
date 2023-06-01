export type UpdateOpenIdConfigReqBody = {
  interactionHook: {
    url: string;
    claims?: Array<string>;
    disabled: boolean;
  };
};
