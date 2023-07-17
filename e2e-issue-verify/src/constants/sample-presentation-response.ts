export const SAMPLE_PRESENTATION_RESPONSE = {
  presentationType: "QueryByExample",
  challengeId: "a06964ec-5b1e-4cbe-b8f1-c72ec882f0bc",
  claims: {
    id: "did:key:z6MkrmpsUsb3ZKtRaK7XuurreKyur7rrp5DCJt8DX4qLqbLU",
    "https://mattr.global/contexts/vc-extensions/defaultVocab#citizenship":
      "Kingdom of Kakapo",
    "https://mattr.global/contexts/vc-extensions/defaultVocab#dateOfIssue":
      "2023-07-06",
    "https://mattr.global/contexts/vc-extensions/defaultVocab#licenseNumber":
      "BA8J8L6",
    "https://mattr.global/contexts/vc-extensions/defaultVocab#pilotName":
      "Joe Doe",
    "https://mattr.global/contexts/vc-extensions/defaultVocab#pilotType":
      "Commercial & Private",
  },
  verified: true,
  holder: "did:key:z6Mkk2rUbACSjREr7cNFR7A1kWwqWqnCfAQR1zjs1esk5nrb",
  presentation: {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiablePresentation"],
    verifiableCredential: [
      {
        type: ["VerifiableCredential", "KakapoAirlinePilotCredential"],
        issuer: {
          id: "did:key:z6MkpnKPPwokibFQrRAvvGKFuDLFmZxw1ZcWA2UY8HHXvTuM",
          name: "Kakapo Airlines",
          logoUrl:
            "https://silvereye.mattrlabs.com/assets/wm80sZB5ZFscf8FJ0oF_k.svg",
          iconUrl:
            "https://silvereye.mattrlabs.com/assets/dggFEuZ6ez6sJ-Wkuo0r-.svg",
        },
        name: "Kakapo Airline Pilot",
        credentialBranding: {
          backgroundColor: "#FEFBFF",
          watermarkImageUrl:
            "https://silvereye.mattrlabs.com/assets/hbkW-o7A3CzfZZqLFx58J.svg",
        },
        issuanceDate: "2023-07-06T01:38:09.745Z",
        expirationDate: "2028-07-06T01:38:09.470Z",
        credentialSubject: {
          id: "did:key:z6MkrmpsUsb3ZKtRaK7XuurreKyur7rrp5DCJt8DX4qLqbLU",
          pilotName: "Joe Doe",
          pilotType: "Commercial & Private",
          citizenship: "Kingdom of Kakapo",
          dateOfIssue: "2023-07-06",
          licenseNumber: "BA8J8L6",
        },
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://w3id.org/vc-revocation-list-2020/v1",
          "https://mattr.global/contexts/vc-extensions/v2",
        ],
        credentialStatus: {
          id: "https://mingyang-labs.vii.mattr.global/core/v1/revocation-lists/7b38964b-9e71-4335-ac1c-59c29e233af5#4",
          type: "RevocationList2020Status",
          revocationListIndex: "4",
          revocationListCredential:
            "https://mingyang-labs.vii.mattr.global/core/v1/revocation-lists/7b38964b-9e71-4335-ac1c-59c29e233af5",
        },
        proof: {
          type: "Ed25519Signature2018",
          created: "2023-07-06T01:38:09Z",
          verificationMethod:
            "did:key:z6MkpnKPPwokibFQrRAvvGKFuDLFmZxw1ZcWA2UY8HHXvTuM#z6MkpnKPPwokibFQrRAvvGKFuDLFmZxw1ZcWA2UY8HHXvTuM",
          proofPurpose: "assertionMethod",
          jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..nKyD43rgDolFAUWR57zXL9wA-qlkVFChITac1XnUf08AkDlB81RZPlLX_XB-lWxS0_qboN4tuBTAtQsEmA6FCw",
        },
      },
    ],
    holder: "did:key:z6Mkk2rUbACSjREr7cNFR7A1kWwqWqnCfAQR1zjs1esk5nrb",
    proof: [
      {
        type: "Ed25519Signature2018",
        created: "2023-07-17T00:43:22Z",
        challenge: "a06964ec-5b1e-4cbe-b8f1-c72ec882f0bc",
        domain: "mingyang-labs.vii.mattr.global",
        jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..gzGD1Y86RhIMSBAkRC-29IX2BbELNFImYZI6MNAE77SL_TBy2eR5BFxvo2V8VgwDN6FhPHw1YyxcGSXzjUK8DQ",
        proofPurpose: "authentication",
        verificationMethod:
          "did:key:z6MkrmpsUsb3ZKtRaK7XuurreKyur7rrp5DCJt8DX4qLqbLU#z6MkrmpsUsb3ZKtRaK7XuurreKyur7rrp5DCJt8DX4qLqbLU",
      },
      {
        type: "Ed25519Signature2018",
        created: "2023-07-17T00:43:22Z",
        challenge: "a06964ec-5b1e-4cbe-b8f1-c72ec882f0bc",
        domain: "mingyang-labs.vii.mattr.global",
        jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..z-5-OU3mb2GAUtjTBcJl6XdIJIqNzIwQjHHJK1OP3WwzOVKO48cX2nDRy_8gIUxf1B52cAEuwFbRHmU-6ZVZDA",
        proofPurpose: "authentication",
        verificationMethod:
          "did:key:z6Mkk2rUbACSjREr7cNFR7A1kWwqWqnCfAQR1zjs1esk5nrb#z6Mkk2rUbACSjREr7cNFR7A1kWwqWqnCfAQR1zjs1esk5nrb",
      },
    ],
  },
};
