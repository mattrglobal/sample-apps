import assert from "assert";
import axios from "axios";
import bodyParser from "body-parser";
import { JsonWebKey } from "crypto";
import dotenv from "dotenv";
import express from "express";
import { Request } from "express";
import http from "http";
import ngrok from "ngrok";

import { Verifier, verifyRequest } from "@mattrglobal/http-signatures";

dotenv.config();

const tenant = process.env.TENANT;

const jwksRequestUrl = `https://${tenant}/core/v1/webhooks/jwks`;
const webhookBaseUrl = `https://${tenant}/core/v1/webhooks`;

const authToken = process.argv[2];

assert(tenant, "Tenant info is missing - add it to your .env file");
assert(
  authToken,
  "Access token is missing - include a valid JWT as an argument"
);

let myWebhookId: string;
let webhookJwks: { keys: (JsonWebKey & { kid: string })[] };
const app = express();

// To ensure it can produce the same HTTP content digest, the raw HTTP content should be used for the body to avoid any lossy transform by a body parser middleware.
app.use(
  bodyParser.json({
    verify: function (
      req: http.IncomingMessage & { rawBody?: string },
      res,
      buf
    ) {
      if (buf && buf.length) {
        req.rawBody = buf.toString("utf8");
      }
    },
  })
);

app.post(
  "/receive-webhook",
  async (request: Request & { rawBody?: string }, response) => {
    try {
      console.log("Webhook callback request received");

      const verifier: Verifier = {
        keyMap: webhookJwks.keys.reduce(
          (acc, jwk) => ({ ...acc, [jwk.kid]: { key: jwk } }),
          {}
        ),
      };
      const { headers, rawBody, body } = request;

      // Verify Http Signature
      const verifyResult = await verifyRequest({
        request,
        verifier,
        body: rawBody,
      });
      // Handle errors caught during signature verification
      if (verifyResult.isErr()) {
        const { error } = verifyResult;
        console.error(
          "Encountered an error while verifying http signature",
          error
        );
        // Return a 200 response to indicate request has been received and does not need to be retried
        response.status(200).send("OK");
        return
      }

      // Handle signature verification failures
      if (!verifyResult.value.verified) {
        const reason = verifyResult.value;
        console.error("Http signature failed to verify", reason);
        // Return a 200 response to indicate request has been received and does not need to be retried
        response.status(200).send("OK");
        return
      }

      // Validate that the webhook id in the request matches the intended webhook
      const webhookId = headers["x-mattr-webhook-id"];
      if (webhookId !== myWebhookId) {
        console.error("Webhook ID does not match");
        // Return a 200 response to indicate request has been received and does not need to be retried
        response.status(200).send("OK");
        return
      }

      // Application specific request handling logic would be added here
      console.log("Signature is valid and webhook id matches", body);

      response.status(200).send("OK");
    } catch (error) {
      console.error("encountered an error", error);
      // Return a 200 response to indicate request has been received and does not need to be retried
      response.status(200).send("OK");
    }
  }
);

const server = app.listen(2001, async () => {
  try {
    const url = await ngrok.connect(2001);
    console.log(`ngrok url is ${url}`);

    // Fetch Mattr JWKs
    const jwksResponse = await axios.get(jwksRequestUrl, {
      headers: { authorization: `Bearer ${authToken}` },
    });

    webhookJwks = jwksResponse.data;

    const createWebhookResponse = await axios.post(
      webhookBaseUrl,
      {
        events: ["OidcIssuerCredentialIssued"],
        url: `${url}/receive-webhook`,
      },
      { headers: { authorization: `Bearer ${authToken}` } }
    );

    myWebhookId = createWebhookResponse.data.id;
    console.log(`webhook id is ${myWebhookId}`);
  } catch (error) {
    console.error("encountered an error: ", error);
  }

  console.log("server listening on port 2001");
});

const cleanup = async (): Promise<void> => {
  server.close();
  if (!myWebhookId) {
    return;
  }

  try {
    console.log("Terminating process, attempting to delete webhook");
    await axios.delete(`${webhookBaseUrl}/${myWebhookId}`, {
      headers: { authorization: `Bearer ${authToken}` },
    });
  } catch (error) {
    console.error(
      "encountered an error while attempting to delete webhook: ",
      error
    );
  }
  process.exit(1);
};

[
  "SIGINT",
  "SIGTERM",
].forEach((evt) => process.on(evt, cleanup));
