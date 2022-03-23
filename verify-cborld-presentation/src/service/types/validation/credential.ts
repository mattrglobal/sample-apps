import { Credential, CredentialSubject } from "../credential";

export const isType = (val: any): val is Credential["type"] => {
  if (typeof val === "string") {
    return true;
  }
  if (!Array.isArray(val)) {
    return false;
  }
  return val.every((item) => typeof item === "string");
};

export const isName = (val: any): val is Credential["name"] => {
  return val === undefined || typeof val === "string";
};

export const isCredentialSubject = (val: any): val is CredentialSubject => {
  if (typeof val === "string") {
    return true;
  }
  if (val.id && typeof val.id === "string") {
    return true;
  }
  return false;
};

export const isIssuer = (val: any): val is { id: string } => {
  if (val.id && typeof val.id === "string") {
    return true;
  }
  return false;
};

export const isCredential = (val: any): val is Credential => {
  return (
    typeof val === "object" &&
    val !== null &&
    isType(val.type) &&
    isName(val.name) &&
    isCredentialSubject(val.credentialSubject) &&
    isIssuer(val.issuer)
  );
};
