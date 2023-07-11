import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  type CreateAuthTokenReqBody,
  type CreateAuthTokenResBody,
} from "@/types/create-auth-token";

export type TenantConfigState = {
  tenantDomain: string;
  createAuthTokenReqBody: CreateAuthTokenReqBody;
  createAuthTokenResBody: CreateAuthTokenResBody;
};

const initialState: TenantConfigState = {
  tenantDomain: '',
  createAuthTokenReqBody: {
    client_id: '',
    client_secret: '',
    audience: '',
    grant_type: '',
  },
  createAuthTokenResBody: {
    access_token: '',
    expires_in: 0,
  }
};

export const tenantConfigSlice = createSlice({
  name: "TenantConfigSlice",
  initialState,
  reducers: {
    update: (state, action: PayloadAction<Partial<TenantConfigState>>) => {
      state = {
        ...state,
        ...action.payload
      };
      console.log(state);
    },
  },
});

export const TenantConfigSliceActions = tenantConfigSlice.actions;

export default tenantConfigSlice.reducer;
