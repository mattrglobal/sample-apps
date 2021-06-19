/*
 * Copyright 2019 - MATTR Limited
 * All rights reserved
 * Confidential and proprietary
 */

import Box from "@material-ui/core/Box";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { Credential as CredentialType, CredentialSubject } from "../service/types/credential";
import { isDomainManifest } from "../service/types/validation/isDomainManifest";

type CredentialProps = {
  credential: CredentialType;
  issuerDomain?: string;
};

export const Credential: React.FC<CredentialProps> = ({ credential, issuerDomain }) => {
  const [issuerImgSrc, setIssuerImgSrc] = useState<string>();
  const [issuerName, setIssuerName] = useState<string>();

  const getSubjectName = (subject: CredentialSubject): string | undefined => {
    const { givenName = "", familyName = "" } = subject;
    if (givenName || familyName) {
      return `${givenName} ${familyName}`;
    }
    return undefined;
  };

  const getCredentialName = (): string => {
    if (credential.name) {
      return credential.name;
    }
    if (typeof credential.type === "string") {
      return credential.type;
    }
    return credential.type.length > 1 ? credential.type[1] : credential.type[0];
  };

  const getSubjectDetails = (): {
    credentialName: string;
    subjectName?: string;
    subjectClaims: { claimName: string; value: any }[];
  } => {
    return {
      credentialName: getCredentialName(),
      subjectName:
        typeof credential.credentialSubject === "string" ? undefined : getSubjectName(credential.credentialSubject),
      subjectClaims: Object.entries(credential.credentialSubject)
        .map(([claimName, value]) => {
          return {
            claimName,
            value,
          };
        })
        .filter(({ claimName }) => claimName !== "id" && claimName !== "givenName" && claimName !== "familyName"),
    };
  };

  useEffect(() => {
    (async () => {
      const domainManifest = await fetch(`${issuerDomain ?? ""}/manifest.json`, {
        method: "get",
      });

      const manifest = await domainManifest.json();
      if (!isDomainManifest(manifest)) {
        console.log("Failed to get domain manifest", manifest);
        return;
      }
      setIssuerImgSrc(manifest.icons[0].src);
      setIssuerName(manifest.name);
    })();
  }, [issuerDomain, setIssuerImgSrc, setIssuerName]);

  const { credentialName, subjectName, subjectClaims } = getSubjectDetails();

  return (
    <Card>
      <CredentialName>{credentialName}</CredentialName>
      <SubjectName>{subjectName}</SubjectName>
      {Boolean(subjectClaims.length) && (
        <Claims>
          <Box display="flex" flexWrap="wrap" alignContent="flex-start" width="100%">
            {subjectClaims.map(({ claimName, value }) => (
              <CredentialBox flexGrow={1} width="250px">
                <CredentialTitle>{claimName}</CredentialTitle>
                <CredentialValue>{value}</CredentialValue>
              </CredentialBox>
            ))}
          </Box>
        </Claims>
      )}
      <CardFooter>
        <Box display="flex">
          <Box flexShrink>{issuerImgSrc && <IssuerImg src={issuerImgSrc} />}</Box>
          <Box display="flex" flexDirection="column" justifyContent="space-around">
            <div>{issuerName}</div>
            <IssuerSubTitle>{issuerDomain}</IssuerSubTitle>
          </Box>
        </Box>
      </CardFooter>
    </Card>
  );
};

const Card = styled.div`
  border-radius: 6px;
  border: 1px solid #dcdadb;
  max-width: 600px;
  padding: 20px;
`;

const CardFooter = styled.div`
  border-top: 1px solid #ccc;
  padding-top: 16px;
  margin-top: 16px;
`;

const CredentialTitle = styled.div`
  font-size: 10px;
  color: #ccc;
`;

const CredentialValue = styled.div`
  font-size: 14px;
`;

const CredentialBox = styled(Box)`
  word-break: break-all;
  padding: 6px;
`;

const CredentialName = styled.div`
  font-size: 18px;
  color: #333132;
  margin-bottom: 8px;
`;

const SubjectName = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: #333132;
  margin-bottom: 24px;
`;

const Claims = styled.div`
  margin-bottom: 4px;
`;

const IssuerImg = styled.img`
  height: 40px;
  margin-right: 8px;
`;

const IssuerSubTitle = styled.div`
  font-size: 12px;
`;
