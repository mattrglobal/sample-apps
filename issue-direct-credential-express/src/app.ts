import path from "path";
import got from "got";
import ngrok from "ngrok";
import assert from "assert";
import dotenv from "dotenv";
import express from "express";
import { v4 as uuid } from "uuid";

import * as service from "./service";
import { RequestContext, PresentationRef, ParsedPresentationResult } from "./types";

const router = express.Router();

/**
 * The default credential claims.
 */
const defaultClaims = {
  context: ["https://schema.org"],
  types: ["Course"],
  claims: {
    givenName: "Chris",
    familyName: "Shin",
    name: "HNC Accounting",
    educationalCredentialAwarded: "Higher National Certificate in Accounting",
  },
};

/**
 * A dictionary of DIDAuth presentation response, keyed by unique session ID.
 */
const receivedPresentations = new Map<PresentationRef, ParsedPresentationResult>();

/**
 * Endpoint that returns the prepared DIDAuth presentation request.
 *
 * https://learn.mattr.global/api-reference/v1.0.1#operation/createPresRequest
 */
router.post("/presentations/request", express.json(), async (req, res, next) => {
  try {
    const uid = uuid();
    const { messagingDid } = req.body;
    console.log("Prepare DIDAuth Presentation request", { uid });
    assert(messagingDid, "Presentation request messaging DID is required");
    const data = await service.createPresentationRequest(req.context, uid, messagingDid);
    res.send({ uid, ...data });
  } catch (err) {
    console.error("Failed to create DIDAuth request", err, err?.response?.body);
    next(err);
  }
});

/**
 * Endpoint that returns the received presentation response.
 *
 * https://learn.mattr.global/guides/verification/presentation/callback
 */
router.get("/presentations/:uid/response", async (req, res) => {
  const { uid } = req.params;
  res.send({ data: receivedPresentations.get(uid) });
});

/**
 * Endpoint that receives the DIDAuth presentation response.
 */
router.post("/presentations/callback", express.json(), async (req, res) => {
  console.log("Received DIDAuth Presentation", req.body);
  const { challengeId, verified, holder } = req.body;
  assert(challengeId, "Invalid DIDAuth response, expected challengeId");

  if (!verified || !holder) {
    console.error("DIDAuth request failed");
  } else {
    receivedPresentations.set(challengeId, { subjectDid: holder });
  }
  res.sendStatus(200);
});

/**
 * Endpoint that issues a verifiable credential to the subject with the given
 * claims, and encode it in an encrypted JWM message.
 *
 * https://learn.mattr.global/api-reference/v1.0.1#operation/createCredential
 */
router.post("/credentials/issue", express.json(), async (req, res, next) => {
  try {
    console.log("Issue direct credential offer", req.body);
    const { context } = req;
    const { subjectDid, issuerDid, messagingDid, ...input } = req.body;

    assert(subjectDid, "Subject DID is required");
    assert(issuerDid, "Issuer DID is required");
    assert(messagingDid, "Messaging DID is required");
    assert(input.claimTypes, "Credential claims types are required");
    assert(input.claimContext, "Credential claims context is required");
    assert(input.claimContent, "Credential claims content is required");

    const credential = await service.createCredential(context, subjectDid, issuerDid, input);
    const offer = await service.createDirectCredentialOffer(
      context,
      subjectDid,
      messagingDid,
      credential
    );
    res.send(offer);
  } catch (err) {
    console.error("Failed to create credential offer", err, err?.response?.body);
    next(err);
  }
});

/**
 * Endpoint that sends async message to the subject's inbox.
 *
 * https://learn.mattr.global/api-reference/v1.0.1#operation/sendMessage
 */
router.post("/messaging/send", express.json({ limit: "2mb" }), async (req, res, next) => {
  try {
    console.log("Send async message", req.body);
    const { subjectDid, message } = req.body;
    assert(subjectDid, "Subject DID is required");
    assert(message, "Encrypted JWM format DIDComm message is required");
    res.send(await service.sendAsyncMessage(req.context, subjectDid, message));
  } catch (err) {
    console.error("Failed to send async message", err, err?.response?.body);
    next(err);
  }
});

/**
 * Endpoint that resolves a shorten URL.
 */
router.get("/resolve/:code", async (req, res, next) => {
  const { code } = req.params;
  const found = service.resolveShortenUrl(code);
  if (found && found.payload) {
    console.log("Resolved shorten URL with JWE payload:", found);
    return res.json(found.payload);
  }
  if (found) {
    console.log("Resolved shorten URL:", found);
    return res.redirect(found.url);
  }
  next(`No shorten URL found with code: ${code}`);
});

/**
 * Render the app page.
 */
router.use("/", async (_, res) => {
  res.render("index", {
    defaultClaims: JSON.stringify(defaultClaims.claims, null, 4),
    defaultClaimContext: defaultClaims.context.join(","),
    defaultClaimTypes: defaultClaims.types.join(","),
    defaultSubjectDid: process.env.SUBJECT_DID,
    defaultIssuerDid: process.env.ISSUER_DID,
    defaultMessagingDid: process.env.ISSUER_DID,
  });
});

// Launch the Express server
(async function bootstrap() {
  // Load environment variables
  dotenv.config();

  // Obtain the Access Token
  const token = process.argv[2];
  assert(token, "Access token is missing - include a valid JWT as an argument");

  const port = process.env.PORT || "3000";
  const tenant = process.env.TENANT;
  const bundleId = process.env.WALLET_BUNDLE_ID;

  assert(tenant, "Environment variable 'TENANT=<Tenant domain>' is required");

  const context: RequestContext = {
    tenant,
    bundleId: bundleId || "global.mattr.wallet",
    // Public tunnel for the HTTP requests, required for presentation callbacks
    ngrokUrl: process.env.NGROK_URL || (await ngrok.connect(parseInt(port))),
    // HTTP client for MATTR platform
    api: got.extend({
      headers: { Authorization: `Bearer ${token}` },
      prefixUrl: `https://${tenant}`,
    }),
  };

  const app = express();
  app.set("views", path.join(__dirname, "../public"));
  app.set("view engine", "ejs");

  app.use((req, _, next) => {
    req.context = context;
    next();
  });
  app.use(router);

  app.listen(port, () => {
    console.log(`Sample App Started`);
    console.log(`Local:        http://localhost:${port}`);
    console.log(`Ngrok tunnel: ${context.ngrokUrl}`);
  });
})().catch(err => {
  console.error("Failed to launch server", err);
  process.exit(1);
});
