import { mattrConfigSchema, type Issuer } from "@/types/common";
import {
  type CreateCredentialReqBody,
  type CredentialBranding,
} from "@/types/create-credential";
import { z } from "zod";
import * as MattrService from "@/services/mattr.service";
import * as CommonService from "@/services/common.service";
import { type EncryptMessageReqBody } from "@/types/encrypt-message";
import { randomUUID } from "crypto";
import { type SendMessageReqBody } from "@/types/send-message";
import { getLogger } from "./logger.service";
import { type AxiosError } from "axios";

export const issueStaticCredentialArgsSchema = z.object({
  config: mattrConfigSchema,
  walletDid: z.string(),
});
export type IssueStaticCredentialArgs = z.infer<
  typeof issueStaticCredentialArgsSchema
>;
export const issueStaticCredential = async (
  args: IssueStaticCredentialArgs
) => {
  const logger = getLogger("CoreService.issueStaticCredential()");
  // Keeping core data for issuer in here after gettng DidDocument
  const issuerDidDocument = {
    did: "___placeholder___",
    keyAgreement: "___placeholder___",
  };

  const credentialBranding: CredentialBranding = {
    backgroundColor: "#000000",
    watermarkImageUrl: "___placeholder___",
  };

  const issuer: Issuer = {
    id: issuerDidDocument.did,
    name: "Kakapo Aviation Association",
    logoUrl: "___placeholder___",
    iconUrl: "___placeholder___",
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
        type: "Commercial & Private",
        citizenship: "Kingdom of Kakapo",
        dateOfIssue: now.toISOString().slice(0, 10),
        licenseNumber: Math.random()
          .toString(36)
          .substring(4, 11)
          .toUpperCase(),
      },
      expirationDate: `${now.setFullYear(now.getFullYear() + 5)}`,
    },
    revocable: true,
  };

  logger.warn("Creating credential");

  await MattrService.createCredential({
    config: args.config,
    body: createCredentialReqBody,
  })
    .then(async (res) => {
      logger.info("Credential created");
      const credential = res.data.credential as unknown;

      // deciding domain whether custom domain is verified
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
      await MattrService.encryptMessage({
        config: args.config,
        body: encryptMessageReqBody,
      })
        .then(async (res) => {
          logger.info("Message encrypted");

          const sendMessageReqBody: SendMessageReqBody = {
            to: args.walletDid,
            message: res.data.jwe as unknown,
          };

          logger.warn("Sending message");
          await MattrService.sendMessage({
            config: args.config,
            body: sendMessageReqBody,
          })
            .then(() => {
              logger.info("Message sent");
            })
            .catch((e: AxiosError) => {
              logger.error("Failed to send message");
              throw e.response?.data;
            });
        })
        .catch((e: AxiosError) => {
          logger.error("Failed to encrypt message");
          throw e.response?.data;
        });
      return;
    })
    .catch((e: AxiosError) => {
      logger.error("Failed to create credential");
      throw e.response?.data;
    });
};

export const createPresentationRequestQueryByExample = () => {
  return;
};
