export type CreateCredentialConfigReqBody = {
  name: string;
  description?: string;
  type: string;
  additionalTypes?: string[];
  contexts?: string[] | Record<string, unknown>;
  issuer: { name: string; logoUrl?: string; iconUrl?: string };
  credentialBranding?: {
    backgroundColor?: string;
    watermarkImageUrl?: string;
  };
  claimMappings?: Record<string, ClaimMapping>;
  persist?: boolean;
  revocable?: boolean;
  claimSourceId?: string;
  expiresIn?: unknown;
};

export type ClaimMapping = {
  mapFrom: string;
  defaultValue?: string;
  required?: boolean;
};
