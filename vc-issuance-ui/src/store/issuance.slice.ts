import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { type DidDocument } from "@/types/did-document";
import {
  type CreateCredentialReqBody,
  type CreateCredentialResBody,
} from "@/types/create-credential";
import {
  type EncryptMessageReqBody,
  type EncryptMessageResBody,
} from "@/types/encrypt-message";
import { type SendMessageReqBody } from "@/types/send-message";
import {
  type CreateAuthTokenReqBody,
  type CreateAuthTokenResBody,
} from "@/types/create-auth-token";

export type IssuanceState = {
  config?: {
    createAuthToken?: {
      reqBody?: CreateAuthTokenReqBody;
      resBody?: CreateAuthTokenResBody;
    };
    tenantDomain?: string;
    completed?: boolean;
  };
  issuerSelection?: {
    issuer?: DidDocument;
    completed?: boolean;
  };
  createCredential?: {
    reqBody?: CreateCredentialReqBody;
    resBody?: CreateCredentialResBody;
  };
  encryptMessage?: {
    reqBody?: EncryptMessageReqBody;
    resBody?: EncryptMessageResBody;
  };
  sendMessage?: {
    reqBody?: SendMessageReqBody;
  };
};

const initialState: IssuanceState = {
  createCredential: {
    reqBody: {
      payload: {
        name: "",
        issuer: { id: "", name: "" },
        type: [""],
        credentialSubject: {
          id: "",
        },
      },
    },
  },
  encryptMessage: {
    reqBody: {
      senderDidUrl: "",
      recipientDidUrls: [""],
      payload: {
        id: "",
        type: "",
        from: "",
        to: [""],
        body: {
          credentials: [{}],
          domain: "",
        },
      },
    },
  },
  sendMessage: {
    reqBody: {
      to: "",
      message: {},
    },
  },
};

export const issuanceSlice = createSlice({
  name: "issuanceSlice",
  initialState,
  reducers: {
    update: (state, action: PayloadAction<IssuanceState>) => {
      const updated = {
        ...state,
        ...action.payload,
      }
      return updated;
    },
  },
});

export const IssuanceSliceActions = issuanceSlice.actions;

export default issuanceSlice.reducer;
