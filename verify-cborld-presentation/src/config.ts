export interface TrustedIssuer {
  readonly DID: string;
  readonly DOMAIN: string;
}

export interface Config {
  readonly TRUSTED_ISSUERS: TrustedIssuer[];
}

// A trusted issuer info in our config would look like: domain+did:method:id which has 2 parts when split by "+".
const TRUSTED_ISSUER_SPLIT_LEN = 2;

export const config: Config = {
  TRUSTED_ISSUERS:
    process.env.REACT_APP_TRUSTED_ISSUERS?.split(",").map((issuer) => {
      const issuerSplits = issuer.split("+");
      if (issuerSplits.length != TRUSTED_ISSUER_SPLIT_LEN) {
        throw Error("Invalid Trusted Issuer Config");
      }
      return { DOMAIN: issuerSplits[0], DID: `${issuerSplits[1]}` };
    }) ?? [],
};
