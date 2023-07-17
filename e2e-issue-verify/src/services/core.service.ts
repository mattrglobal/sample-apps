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

  // Create a new did:key of type Ed25519 as the Issuer
  // We DO NOT recommend using this approach in production systems
  // Instead, you should be storing the Issuer DID information somewhere in your system, ready for retrieval when required
  // We decided to create new DIDs for this flow to show you exactly where the DID values come from, so you don't risk spending hours debugging.
  const createDidRes = await MattrService.createDid({
    config: args.config,
    body: {
      method: "key",
    },
  });
  const didDocument = createDidRes.data;
  const keyAgreementObj = didDocument.localMetadata.initialDidDocument
    .keyAgreement[0] as { id: string };
  // Keeping core data for issuer in here after gettng DidDocument
  const issuerDidDocument = {
    did: didDocument.did,
    keyAgreement: keyAgreementObj.id,
  };

  const credentialBranding: CredentialBranding = {
    backgroundColor: CREDENTIAL_INFO.credentialBranding.backgroundColor,
    watermarkImageUrl: CREDENTIAL_INFO.credentialBranding.watermarkImageUrl,
  };

  const issuer: Issuer = {
    id: issuerDidDocument.did,
    name: CREDENTIAL_INFO.issuer.name,
    logoUrl: CREDENTIAL_INFO.issuer.logoUrl,
    iconUrl: CREDENTIAL_INFO.issuer.iconUrl,
  };

  const now = new Date();
  const createCredentialReqBody: CreateCredentialReqBody = {
    payload: {
      name: CREDENTIAL_INFO.name,
      type: CREDENTIAL_INFO.type,
      issuer,
      "@context": CREDENTIAL_INFO.contexts,
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
      status: "Credential created, but failed to encrypt credential",
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
 * Creating a PresentationRequest for rendering QR code on front-end
 *
 * 1. Create DID (did:key, Ed25519) of the trusted issuer
 * 2. Create PresentationTemplate
 * 3. Create PresentationRequest
 * 4. Sign PresentationRequest
 * 5. Add JWS to DB
 * 6. Return DB.PresentationRequest
 * @param args MattrConfig
 * @returns Prisma.PresentationRequest
 */
export const createPresentationRequestQueryByExample = async (
  args: MattrConfig
) => {
  // Creating new DID
  // IMPORTANT: We DO NOT recommend doing this in production systems.
  // You should have a permanant DID store in your environment for any issuance & verification purposes.
  // We decided on creating new DIDs each time so that you don't have to struggle finding the right DID document/URLs.
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
          required: false,
          issuer: trustedIssuer.did,
        },
      ],
    },
  };

  // Creating new PresentationTemplate
  // IMPORTANT: We DO NOT recommend doing this in production systems.
  // You should have a permanant PresentationTemplate store in your system for verification purposes.
  // We decided on creating new PresentationTemplates each time so that you don't have to risk with constructing the incorrect payloads when creating PresentationTemplates by yourself.
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
  console.log(
    `Created PresentationRequest where ID is ${record.id}, stored to DB`
  );
  return record;
};
