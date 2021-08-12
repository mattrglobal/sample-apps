import assert from "assert";
import qrcode from "qrcode";
import { v4 as uuid } from "uuid";

import { RequestContext } from "./types";

type ShortenItem = { url: string; payload: string | undefined };

const shortenUrls = new Map<string, ShortenItem>();

/**
 * The Direct Credential Offer JWM message much be Base64 URL encoded
 */
const base64UrlEncode = (str: string) => encodeURIComponent(Buffer.from(str).toString("base64"));

/**
 * Cache the created templates to reduce the resource consumption
 */
const cachedPresentationTemplates = new Map<string, string>();

export function createShortenUrl(ctx: RequestContext, data: string | object): string {
  const { tenant, ngrokUrl } = ctx;
  const code = uuid();

  // If the data is using JSON Serialization, it needs to be Base64 encoded
  const request = typeof data === "string" ? data : base64UrlEncode(JSON.stringify(data));

  // The request payload might be too large that Ngrok will block such URL. Mobile Wallet support
  // parsing the request from query string or response JSON body.
  if (typeof data === "object") {
    shortenUrls.set(code, { url: `https://${tenant}`, payload: request });
  } else {
    shortenUrls.set(code, { url: `https://${tenant}?request=${request}`, payload: undefined });
  }
  return `${ngrokUrl}/resolve/${code}`;
}

export function resolveShortenUrl(code: string): ShortenItem | undefined {
  return shortenUrls.get(code);
}

export async function encodeDidCommRequest(ctx: RequestContext, jwm: string | object) {
  const { bundleId } = ctx;

  // Shorten the didcomm URL to reduce the size of QR Code or DeepLink
  const url = createShortenUrl(ctx, jwm);
  const didcomm = `didcomm://${url}`;
  return {
    qrcode: await qrcode.toString(didcomm, { margin: 0, width: 250, type: "svg" }),
    deeplink: `${bundleId}://accept/${Buffer.from(didcomm).toString("base64")}`,
  };
}

export async function getOrCreateDidAuthTemplate(ctx: RequestContext, uid: string) {
  const { api } = ctx;
  const templateName = `sample_direct_credential_didauth_request`;

  if (!cachedPresentationTemplates.has(templateName)) {
    const domain = await getTenantDomain(ctx);
    const { id: templateId } = await api
      .post("v1/presentations/templates", {
        json: { domain, name: `${templateName}:${uid}`, query: [{ type: "DIDAuth" }] },
      })
      .json();

    console.log("Created DIDAuth presentation template:", templateId);
    cachedPresentationTemplates.set(templateName, templateId);
  }
  return cachedPresentationTemplates.get(templateName)!;
}

export async function createPresentationRequest(
  ctx: RequestContext,
  uid: string,
  messagingDid: string
) {
  const { api, ngrokUrl } = ctx;

  const didDoc = await api.get(`v1/dids/${messagingDid}`).json<Record<string, any>>();
  const didUrl = didDoc.didDocument?.authentication[0];
  assert(didUrl, "Cannot resolve presentation request signing DIDUrl");

  const callbackUrl = `${ngrokUrl}/presentations/callback`;
  const templateId = await getOrCreateDidAuthTemplate(ctx, uid);

  const { request } = await api
    .post("v1/presentations/requests", {
      json: { challenge: uid, did: messagingDid, templateId, callbackUrl },
    })
    .json();
  console.log("Created DIDAuth presentation request:", request);

  const signedRequest = await api
    .post("v1/messaging/sign", { json: { payload: request, didUrl } })
    .json<string>();
  console.log("Signed DIDAuth presentation request:", signedRequest);

  const result = await encodeDidCommRequest(ctx, signedRequest);
  return { ...result, jws: signedRequest };
}

export async function createCredential(
  ctx: RequestContext,
  subjectDid: string,
  issuerDid: string,
  input: {
    claimTypes: string[];
    claimContext: string[];
    claimContent: Record<string, unknown>;
  }
) {
  const { api } = ctx;
  const { claimTypes, claimContext, claimContent } = input;

  const credentialPayload = {
    "@context": ["https://www.w3.org/2018/credentials/v1", ...claimContext],
    type: ["VerifiableCredential", ...claimTypes],
    issuer: { id: issuerDid, name: "Sample App" },
    subjectId: subjectDid,
    claims: claimContent,
  };
  const { credential } = await api.post("v1/credentials", { json: credentialPayload }).json();
  console.log("Created verifiable credential", credential);
  return credential;
}

export async function createDirectCredentialOffer(
  ctx: RequestContext,
  subjectDid: string,
  messagingDid: string,
  credential: Record<string, unknown>
) {
  const { api } = ctx;

  const issuer = await api.get(`v1/dids/${messagingDid}`).json<Record<string, any>>();
  const issuerDidUrl = issuer.localMetadata?.initialDidDocument?.keyAgreement[0]?.id;
  assert(issuerDidUrl, "Cannot resolve issuer encryption key");

  // Lookup custom domain, fallback to tenant domain
  const domain = await getTenantDomain(ctx);

  const messagePayload = {
    senderDidUrl: issuerDidUrl,
    recipientDidUrls: [subjectDid],
    payload: {
      id: uuid(),
      to: [subjectDid],
      from: messagingDid,
      type: "https://mattr.global/schemas/verifiable-credential/offer/Direct",
      created_time: Date.now(),
      body: { domain, credentials: [credential] },
    },
  };
  const { jwe } = await api.post("v1/messaging/encrypt", { json: messagePayload }).json();
  console.log("Encrypted JWM message", jwe);

  const result = await encodeDidCommRequest(ctx, jwe as object);
  return { ...result, jwe };
}

export async function getTenantDomain(ctx: RequestContext) {
  const { api, tenant } = ctx;
  try {
    const result = await api.get("v1/config/domain").json<{ domain: string }>();
    return result.domain;
  } catch (err) {
    return tenant;
  }
}

export async function sendAsyncMessage(ctx: RequestContext, subjectDid: string, message: object) {
  const { api } = ctx;
  const payload = { to: subjectDid, message };
  return await api.post("v1/messaging/send", { json: payload }).json();
}
