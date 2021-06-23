export type TrustedIssuer = {
  did: string;
  domain: string;
};

export const trustedIssuers: TrustedIssuer[] = [
  // example issuer
  {
    did: "did:key:z6Mkne6kfQ2bY396dKTuraGLxiDoBrXXjVvH2Zv7nA1MnDoM",
    domain: "http://localhost:3000",
  },
];
