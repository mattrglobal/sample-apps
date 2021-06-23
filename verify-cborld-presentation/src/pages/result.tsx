import { Box, Link, StylesProvider } from "@material-ui/core";
import { encode as base64Encode, decode as base64Decode } from "@stablelib/base64";
import base32Decode from "base32-decode";
import Lottie from "lottie-react";
import { inflate } from "pako";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import errorAnimation from "../assets/lotti/error.json";
import loadingSpinnerAnimation from "../assets/lotti/loadingSpinner.json";
import successAnimation from "../assets/lotti/success.json";
import { Credential, GenericButton } from "../components";
import type { Credential as CredentialType } from "../service/types";
import { isCredential } from "../service/types/validation/credential";
import { trustedIssuers } from "../trustedIssuers";

export interface ResultPageProps {
  qrCode: string | undefined;
}

type VerifiationStatus = "checking" | "failed" | "success";

export const ResultPage: React.FC<ResultPageProps> = (props: ResultPageProps) => {
  const [credential, setCredential] = useState<CredentialType>();
  const [trustedIssuer, setTrustedIssuer] = useState<string>();
  const [verificationState, setVerificationState] = useState<VerifiationStatus>("checking");

  useEffect(() => {
    const qrCode = props.qrCode;
    if (qrCode) {
      (async () => {
        const base64EncodedCborData = base64Encode(inflate(new Uint8Array(base32Decode(qrCode, "RFC4648"))));

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
            data: base64EncodedCborData,
          }),
        });

        if (!fetchResult.ok) {
          console.log("could not convert cbor data", fetchResult.body);
          return setVerificationState("failed");
        }
        const { data } = await fetchResult.json();
        const decodedJsonld = JSON.parse(Buffer.from(base64Decode(data)).toString());

        // Extract credential
        const credential = decodedJsonld.verifiableCredential[0];
        if (!isCredential(credential)) {
          console.log("credential failed validation", credential);
          return setVerificationState("failed");
        }
        setCredential(credential);

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
          return setVerificationState("failed");
        }

        // Check if trusted issuer
        const foundTrustedIssuer = trustedIssuers.find(({ did }) => credential.issuer.id === did);
        if (!foundTrustedIssuer) {
          console.log("credential issuer is not part of the trusted issuer list", credential.issuer.id);
          return setVerificationState("failed");
        }
        setTrustedIssuer(foundTrustedIssuer.domain);
        setVerificationState("success");
      })();
    }
  }, [props.qrCode, setCredential, setTrustedIssuer, setVerificationState]);

  return (
    <StylesProvider injectFirst>
      <Box display="flex" alignItems="center" flexDirection="column" mb={7}>
        <h2>{getStatusTitle(verificationState)}</h2>
        <VerificationStateImage>
          <Lottie animationData={getStatusLottieSource(verificationState)} loop={verificationState === "checking"} />
        </VerificationStateImage>
        {credential && <Credential credential={credential} issuerDomain={trustedIssuer} />}
        <Box mt={7}>
          <Link component={GenericButton} href="/">
            <GenericButton>Finish</GenericButton>
          </Link>
        </Box>
      </Box>
    </StylesProvider>
  );
};

const getStatusLottieSource = (status: VerifiationStatus): Record<string, unknown> => {
  switch (status) {
    case "success":
      return successAnimation;
    case "checking":
      return loadingSpinnerAnimation;
    case "failed":
      return errorAnimation;
  }
};

const getStatusTitle = (status: VerifiationStatus): string => {
  switch (status) {
    case "success":
      return "Success";
    case "checking":
      return "Checking";
    case "failed":
      return "Invalid credential";
  }
};

const VerificationStateImage = styled.div`
  width: 160px;
  margin-bottom: 24px;
`;
