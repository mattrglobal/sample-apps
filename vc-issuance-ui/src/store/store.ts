import { configureStore } from "@reduxjs/toolkit";
import tenantConfigReducer from "@/store/tenant-config.slice";
import issuanceReducer from "@/store/issuance.slice";

export const store = configureStore({
  reducer: {
    // tenantConfigReducer,
    issuanceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
