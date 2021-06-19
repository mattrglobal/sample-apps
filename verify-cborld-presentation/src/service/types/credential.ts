/*
 * Copyright 2019 - MATTR Limited
 * All rights reserved
 * Confidential and proprietary
 */

export interface CredentialSubject {
  readonly id?: string;
  readonly [key: string]: any;
}

export type Credential = {
  type: string | string[];
  name?: string;
  credentialSubject: string | CredentialSubject;
  issuer: {
    id: string;
  };
};
