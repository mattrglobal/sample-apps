import { encode as base64Encode, decode as base64Decode } from "@stablelib/base64";
import base32Decode from "base32-decode";
import { inflate } from "pako";

import { config } from "../config";

import { Credential } from "./types";
import { isCredential } from "./types/validation/credential";

type VerifyQrCodePresentationResponse = {
  verified: boolean;
  credential?: Credential;
  issuerDomain?: string;
};

export const verifyQrCodePresentation = async (qrCode: string): Promise<VerifyQrCodePresentationResponse> => {
  const decodedQrData = inflate(new Uint8Array(base32Decode(qrCode, "RFC4648")));

  // Decode cbor using platform
  const fetchResult = await fetch(`/core/v1/linkeddata/convert`, {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      options: {
        inputFormat: "cborld",
        outputFormat: "jsonld",
        outputEncoding: "base64",
      },
      data: base64Encode(decodedQrData),
    }),
  });

  if (!fetchResult.ok) {
    console.log("could not convert cbor data", fetchResult.body);
    return { verified: false };
  }
  const { data } = await fetchResult.json();
  const decodedJsonld = JSON.parse(Buffer.from(base64Decode(data)).toString());

  // Extract credential
  const credential = decodedJsonld.verifiableCredential[0];
  if (!isCredential(credential)) {
    console.log("credential failed validation", credential);
    return { verified: false };
  }

  // use platform to verify the presentation
  const verifyResult = await fetch(`/core/v1/presentations/verify`, {
    method: "post",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      presentation: decodedJsonld,
    }),
  });

  const { verified } = await verifyResult.json();
  if (!verified) {
    console.log("failed to verify presentation", decodedJsonld);
    return { verified: false };
  }

  // Check if trusted issuer
  const foundTrustedIssuer = config.TRUSTED_ISSUERS.find(({ DID }) => credential.issuer.id === DID);
  const issuerDomain = foundTrustedIssuer ? foundTrustedIssuer.DOMAIN : undefined;
  if (!foundTrustedIssuer) {
    console.log("credential issuer is not part of the trusted issuer list", credential.issuer.id);
  }
  return {
    verified: true,
    credential,
    issuerDomain,
  };
};
