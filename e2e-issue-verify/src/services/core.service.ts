import { type MattrConfig, type Issuer } from "@/types/common";
import {
  type CreateCredentialReqBody,
  type CredentialBranding,
} from "@/types/create-credential";
import * as MattrService from "@/services/mattr.service";
import { type EncryptMessageReqBody } from "@/types/encrypt-message";
import { randomUUID } from "crypto";
import { type SendMessageReqBody } from "@/types/send-message";
import { getLogger } from "./logger.service";
import {
  type IssueStaticCredentialArgs,
  type IssueStaticCredentialRes,
} from "@/types/issue-static-credential";
import { type QueryByExample } from "@/types/presentation";
import { env } from "@/env.mjs";
import { prisma } from "@/server/db";
import { CREDENTIAL_INFO } from "@/constants/payloads";

export const issueStaticCredential = async (
  args: IssueStaticCredentialArgs
) => {
  let res: IssueStaticCredentialRes = {
    success: true,
    status: "Credential issued",
  };
  const logger = getLogger("CoreService.issueStaticCredential()");
  // Keeping core data for issuer in here after gettng DidDocument
  const issuerDidDocument = {
    did: "did:key:z6MkpnKPPwokibFQrRAvvGKFuDLFmZxw1ZcWA2UY8HHXvTuM",
    keyAgreement:
      "did:key:z6MkpnKPPwokibFQrRAvvGKFuDLFmZxw1ZcWA2UY8HHXvTuM#z6LSnSySouLZWRPAx4x4ArWzaRgyCNBSwpnikV7ZnoxUNVto",
  };

  const credentialBranding: CredentialBranding = {
    backgroundColor: "#FEFBFF",
    watermarkImageUrl:
      "https://silvereye.mattrlabs.com/assets/hbkW-o7A3CzfZZqLFx58J.svg",
  };

  const issuer: Issuer = {
    id: issuerDidDocument.did,
    name: "Kakapo Airlines",
    logoUrl: "https://silvereye.mattrlabs.com/assets/wm80sZB5ZFscf8FJ0oF_k.svg",
    iconUrl: "https://silvereye.mattrlabs.com/assets/dggFEuZ6ez6sJ-Wkuo0r-.svg",
  };

  const now = new Date();
  const createCredentialReqBody: CreateCredentialReqBody = {
    payload: {
      name: "Kakapo Airline Pilot",
      type: ["KakapoAirlinePilotCredential"],
      issuer,
      credentialBranding,
      credentialSubject: {
        id: args.walletDid,
        pilotName: "Joe Doe",
        pilotType: "Commercial & Private",
        citizenship: "Kingdom of Kakapo",
        dateOfIssue: now.toISOString().slice(0, 10),
        licenseNumber: Math.random()
          .toString(36)
          .substring(4, 11)
          .toUpperCase(),
      },
      expirationDate: new Date(
        now.setFullYear(now.getFullYear() + 5)
      ).toISOString(),
    },
    revocable: true,
  };

  logger.warn("Creating credential");

  const createCredentialRes = await MattrService.createCredential({
    config: args.config,
    body: createCredentialReqBody,
  });
  if (createCredentialRes.status !== 201) {
    return (res = {
      success: false,
      status: "Failed to create credential",
    });
  }

  const credential = createCredentialRes.data.credential as unknown;

  // choosing domain for encryption depends on whether custom domain is verified
  const getDomain = () => {
    const { did } = issuerDidDocument;
    if (did.startsWith("did:web")) {
      return did.slice(8, did.length);
    } else {
      return args.config.tenantDomain;
    }
  };

  const encryptMessageReqBody: EncryptMessageReqBody = {
    senderDidUrl: issuerDidDocument.keyAgreement,
    recipientDidUrls: [args.walletDid],
    payload: {
      id: randomUUID(),
      type: "https://mattr.global/schemas/verifiable-credential/offer/Direct",
      from: issuerDidDocument.did,
      to: [args.walletDid],
      body: {
        credentials: [credential],
        domain: getDomain(),
      },
    },
  };

  logger.warn("Encrypting message");
  const encryptMessageRes = await MattrService.encryptMessage({
    config: args.config,
    body: encryptMessageReqBody,
  });
  if (encryptMessageRes.status !== 200) {
    return (res = {
      success: false,
      status: "Failed to encrypt credential",
    });
  }

  const sendMessageReqBody: SendMessageReqBody = {
    to: args.walletDid,
    message: encryptMessageRes.data.jwe as unknown,
  };

  logger.warn("Sending message");
  const sendMessageRes = await MattrService.sendMessage({
    config: args.config,
    body: sendMessageReqBody,
  });
  if (sendMessageRes.status !== 200) {
    return (res = {
      success: false,
      status: "Credential encrypted, but failed to send credential",
    });
  }
  return res;
};

/**
 * Create DID (did:key, Ed25519) of the trusted issuer
 * Create PresentationRequest
 * Sign PresentationRequest
 * Add JWS to DB
 * Return DB.PresentationRequest
 * @param args
 * @returns Prisma.PresentationRequest
 */
export const createPresentationRequestQueryByExample = async (
  args: MattrConfig
) => {
  const didDocument = await MattrService.createDid({
    config: args,
    body: {
      method: "key",
    },
  });
  console.log(`Created new DID`);

  const trustedIssuer = {
    did: didDocument.data.did,
    authenticationKey: didDocument.data.localMetadata.initialDidDocument
      .authentication[0] as string,
  };

  const query: QueryByExample = {
    required: true,
    reason: CREDENTIAL_INFO.requestReason,
    example: {
      "@context": CREDENTIAL_INFO.contexts,
      type: CREDENTIAL_INFO.type,
      trustedIssuer: [
        {
          required: true,
          issuer: trustedIssuer.did,
        },
      ],
    },
  };

  const createPresentationTemplateRes =
    await MattrService.createPresentationTemplate({
      config: args,
      body: {
        domain: args.tenantDomain,
        name: `PRESENTATION_TEMPLATE - ${randomUUID()}`,
        query: [
          {
            type: "QueryByExample",
            credentialQuery: [query],
          },
        ],
      },
    });

  const templateId = createPresentationTemplateRes.data.id;
  console.log(`Created PresentationTemplate, ID: ${templateId}`);

  const challenge = randomUUID();

  const createPresentationRequestRes =
    await MattrService.createPresentationRequest({
      config: args,
      body: {
        challenge,
        did: trustedIssuer.did,
        templateId,
        callbackUrl: `${env.NEXT_PUBLIC_APP_URL}/api/receive-presentation-response`,
      },
    });
  const requestId = createPresentationRequestRes.data.id;
  console.log(`Created PresentationRequest, ID: ${requestId}`);

  const signMessageRes = await MattrService.signMessage({
    config: args,
    body: {
      didUrl: trustedIssuer.authenticationKey,
      payload: createPresentationRequestRes.data.request as unknown,
    },
  });
  console.log(`Signed PresentationRequest`);

  const jws = signMessageRes.data as string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const expiresAt = createPresentationRequestRes.data.request
    .expires_time as number;

  console.log(`Storing PresentationRequest to DB for verification...`);
  const record = await prisma.presentationRequest.create({
    data: {
      signedJws: jws,
      challenge,
      expiresAt,
    },
    select: {
      id: true,
      signedJws: true,
      challenge: true,
      expiresAt: true,
    },
  });
  console.log(`Done`);
  return record;
};
