export interface CreateCredentialReqBody {
  "@context": string[];
  type: string | string[];
  claims: any;
  issuer: Issuer;
}

interface Issuer {
  id: string;
  name: string;
  logoUrl?: string;
  iconUrl?: string;
}
