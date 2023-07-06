import { type Issuer } from "@/types/common";
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
import { z } from "zod";

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

const createPresReqQueryByExampleResSchema = z.object({
  requestId: z.string(),
  didcommUrl: z.string(),
})
type CreatePresReqQueryByExampleRes = z.infer<typeof createPresReqQueryByExampleResSchema>;
export const createPresentationRequestQueryByExample = () => {
  return;
};
