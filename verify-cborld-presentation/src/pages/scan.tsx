import { Box, Button } from "@material-ui/core";
import React from "react";
import { useHistory } from "react-router";
import QrReader from "react-web-qr-reader";
import styled from "styled-components";

import { Description, DescriptionTitle } from "../components";

import { getQrData } from "./qr";

export interface ScanPageProps {
  onScannedQrCodeChange: (scannedQrCode: string) => void;
}

export const ScanPage: React.FC<ScanPageProps> = (props) => {
  const history = useHistory();

  const onScan = async (data: any): Promise<void> => {
    if (typeof data.data === "string") {
      console.log("scanned QR code", data.data);
      props.onScannedQrCodeChange(data.data);
      return history.push("/result");
    }
    console.log("scanned QR code but no data");
  };

  const onScanError = (): void => {
    console.log("scan error");
  };

  const mockScanEvent = async (): Promise<void> => {
    onScan({ data: getQrData() });
  };

  return (
    <div>
      <NavButtonContainer>
        <NavLink href="/home">
          <Box mr={1} display="flex">
            <img src="./static/left-arrow.svg" />
          </Box>
          Back
        </NavLink>
      </NavButtonContainer>
      <DescriptionTitle>Scan</DescriptionTitle>
      <Description>You can easily and securely authenticate by scanning QR codes.</Description>
      {/* <Button onClick={mockScanEvent}>triggerOnScan</Button> */}
      <QrReader delay={300} onError={onScanError} resolution={1080} onScan={onScan} />
    </div>
  );
};

const NavButtonContainer = styled.div`
  top: 0;
  left: 0;
  margin: 20px;
  position: absolute;
  color: #fff;
`;

const NavLink = styled.a`
  display: flex;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
`;
