import { type RootState } from "@/store/store";
import React from "react";
import { JsonView, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { useSelector } from "react-redux";

const IssuerDidData = () => {
  const state = useSelector((state: RootState) => state.issuanceReducer);
  const { issuerSelection } = state;
  return (
    <JsonView
      data={issuerSelection?.issuer ? issuerSelection?.issuer : {}}
      shouldInitiallyExpand={() => true}
      style={darkStyles}
    />
  );
};

export default IssuerDidData;
