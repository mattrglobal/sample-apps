import { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import Axios from "axios-observable";
import { randomUUID } from "crypto";
import { catchError, firstValueFrom, map } from "rxjs";

/**
 * Barebone function to issue a basic credential via messaging
 *
 * Steps to issue credential:
 * - Call this function anywhere in server-side code to issue yourself credentials
 * - Pass in the an argument that satisfies IssueCredentialArgs type where:
 * 1. TOKEN -> Auth token from the MATTR tenant you want to use issuers for
 * 2. WALLET_DID -> Public DID of the wallet you want to issue credential to
 * 3. ISSUER_DID -> DID of the Issuer from the same TENANT_DOMAIN
 * 4. SENDER_DID_URL -> DID_DOCUMENT.initialDidDocument.keyAgreement[0].id where DID_DOCUMENT is the same DID where you get ISSUER_DID from
 * 5. TENANT_DOMAIN -> Tenant domain that has the DID you want to use as the issuer
 * @param args: IssueCredentialArgs
 * @example
 * await issueCredential({
    TOKEN: "YOUR_TOKEN",
    WALLET_DID: "YOUR_WALLET_DID",
    ISSUER_DID: "YOUR_ISSUER_DID",
    SENDER_DID_URL: "SENDER_DID_URL",
    TENANT_DOMAIN: "YOUR_TENANT_DOMAIN.vii.mattr.global",
  });
 */
export const issueCredential = async (args: IssueCredentialArgs) => {
  const mattr = new MattrService(`https://${args.TENANT_DOMAIN}`);
  const token = args.TOKEN;
  const credentialType = "TESTING";
  const emojis = {
    greenTick: "✅",
    redCross: "❌",
    lighting: "⚡",
    rocket: "🚀",
  };

  // create credential
  const createCredentialReqBody: CreateCredentialReqBody = {
    payload: {
      name: "TEST",
      description: "TESTING",
      type: [credentialType],
      issuer: {
        id: args.ISSUER_DID,
        name: "TEST",
      },
      credentialSubject: {
        id: args.WALLET_DID,
        isTesting: "YES",
      },
    },
  };
  const createCredentialRes = await mattr.createCredential({
    token,
    body: createCredentialReqBody,
  });
  console.log(`${emojis.greenTick} Credential created ${credentialType}`);

  // encrypt message
  const encryptMessageReqBody: EncryptMessageReqBody<SendMessagePayload> = {
    senderDidUrl: args.SENDER_DID_URL,
    recipientDidUrls: [args.WALLET_DID],
    payload: {
      id: randomUUID(),
      type: "https://mattr.global/schemas/verifiable-credential/offer/Direct",
      to: [args.WALLET_DID],
      from: args.ISSUER_DID,
      created_time: Date.now(),
      body: {
        credentials: [createCredentialRes.data.credential as Record<string, unknown>],
        domain: args.TENANT_DOMAIN,
      },
    },
  };
  const encryptMessageRes = await mattr.encryptMessage({
    token,
    body: encryptMessageReqBody,
  });
  console.log(`${emojis.greenTick} Message encryped`);

  // send message
  await mattr.sendMessage({
    token,
    body: {
      to: args.WALLET_DID,
      message: encryptMessageRes.data.jwe as Record<string, unknown>,
    },
  });
  console.log(`${emojis.greenTick} Message sent`);
};

class MattrService {
  constructor(private readonly baseUrl: string) {}

  private buildAxiosConfig = (token: string): AxiosRequestConfig => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  public async createCredential(args: CreateCredentialArgs): Promise<AxiosResponse<CreateCredentialResBody>> {
    const url = `${this.baseUrl}/v2/credentials/web-semantic/sign`;
    const data = args.body;
    const config = this.buildAxiosConfig(args.token);
    const res = Axios.post(url, data, config)
      .pipe(map(res => res))
      .pipe(
        catchError((error: AxiosError) => {
          throw error.response?.data;
        })
      );
    return await firstValueFrom(res);
  }

  public async encryptMessage(args: EncryptMessageArgs): Promise<AxiosResponse<EncryptMessageResBody>> {
    const url = `${this.baseUrl}/core/v1/messaging/encrypt`;
    const data = args.body;
    const config = this.buildAxiosConfig(args.token);
    const res = Axios.post(url, data, config)
      .pipe(map(res => res))
      .pipe(
        catchError((error: AxiosError) => {
          throw error.response?.data;
        })
      );
    return await firstValueFrom(res);
  }

  public async sendMessage(args: SendMessageArgs): Promise<AxiosResponse> {
    const url = `${this.baseUrl}/core/v1/messaging/send`;
    const data = args.body;
    const config = this.buildAxiosConfig(args.token);
    const res = Axios.post(url, data, config)
      .pipe(map(res => res))
      .pipe(
        catchError((error: AxiosError) => {
          throw error.response?.data;
        })
      );
    return await firstValueFrom(res);
  }
}

export type IssueCredentialArgs = {
  TOKEN: string;
  WALLET_DID: string;
  ISSUER_DID: string;
  SENDER_DID_URL: string;
  TENANT_DOMAIN: string;
};

type CreateCredentialArgs = {
  token: string;
  body: CreateCredentialReqBody;
};

type CreateCredentialReqBody<CredentialSubject = unknown> = {
  payload: {
    name: string;
    description?: string;
    "@context"?: string[];
    type: string[];
    issuer: Issuer;
    credentialSubject: CredentialSubject;
    credentialBranding?: CredentialBranding;
    expirationDate?: string;
  };
  persist?: boolean;
  revocable?: boolean;
};

type CredentialBranding = {
  backgroundColor?: string;
  watermarkImageUrl?: string;
};

type Issuer = {
  id: string;
  name: string;
  iconUrl?: string;
  logoUrl?: string;
};

type CreateCredentialResBody = {
  id: string;
  issuanceDate: string;
  credential?: unknown;
};

type EncryptMessageArgs = {
  token: string;
  body: EncryptMessageReqBody;
};

type EncryptMessageReqBody<Payload = unknown> = {
  senderDidUrl: string;
  recipientDidUrls: string[];
  payload: Payload;
};

type EncryptMessageResBody = {
  jwe?: Record<string, unknown>;
};

type SendMessagePayload = {
  id: string;
  type: string;
  to: string[];
  from: string;
  created_time: number;
  body: {
    credentials: Record<string, unknown>[];
    domain: string;
  };
};

type SendMessageArgs = {
  token: string;
  body: SendMessageReqBody;
};

type SendMessageReqBody = {
  to: string;
  message: string | Record<string, unknown>;
};
