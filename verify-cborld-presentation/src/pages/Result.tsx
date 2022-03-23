import { Box, Link, StylesProvider } from "@material-ui/core";
import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import errorAnimation from "../assets/lotti/error.json";
import loadingSpinnerAnimation from "../assets/lotti/loadingSpinner.json";
import successAnimation from "../assets/lotti/success.json";
import { Credential, GenericButton } from "../components";
import type { Credential as CredentialType } from "../service/types";
import { verifyQrCodePresentation } from "../service/verify";

type VerificationStatus = "checking" | "failed" | "success" | "unrecognized";

type ResultPageProps = {
  qrCode?: string;
};
export const ResultPage: React.FC<ResultPageProps> = (props) => {
  const [credential, setCredential] = useState<CredentialType>();
  const [trustedIssuer, setTrustedIssuer] = useState<string>();
  const [verificationState, setVerificationState] = useState<VerificationStatus>("checking");
  const { qrCode } = props;

  useEffect(() => {
    if (!qrCode) {
      return;
    }
    (async () => {
      const { verified, credential, issuerDomain } = await verifyQrCodePresentation(qrCode);
      setCredential(credential);
      setVerificationState(verified ? (issuerDomain !== undefined ? "success" : "unrecognized") : "failed");
      setTrustedIssuer(issuerDomain);
    })();
  }, [qrCode, setCredential, setTrustedIssuer, setVerificationState]);

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

const getStatusLottieSource = (status: VerificationStatus): Record<string, unknown> => {
  switch (status) {
    case "success":
      return successAnimation;
    case "checking":
      return loadingSpinnerAnimation;
    case "failed":
      return errorAnimation;
    case "unrecognized":
      return errorAnimation;
  }
};

const getStatusTitle = (status: VerificationStatus): string => {
  switch (status) {
    case "success":
      return "Success";
    case "checking":
      return "Checking";
    case "failed":
      return "Invalid credential";
    case "unrecognized":
      return "Issuer Unrecognized";
  }
};

const VerificationStateImage = styled.div`
  width: 160px;
  margin-bottom: 24px;
`;
