export interface CreatePresentationTemplateArgs {
  body: {
    domain: string;
    name: string;
    query: PresentationTemplateQuery;
  };
}

interface PresentationTemplateQuery {
  type: "QueryByExample" | "QueryByFrame" | "DIDAuth";
  credentialQuery?: QueryByExample[] | QueryByFrame[];
}

interface QueryByExample {
  required: boolean;
  reason?: string;
  example: QueryByExampleDetails[];
}

interface QueryByExampleDetails {
  "@context": any[];
  type: string[] | string;
  trustedIssuer: TrustedIssuer[];
}

interface TrustedIssuer {
  required: boolean;
  issuer: string;
}

interface QueryByFrame {}
