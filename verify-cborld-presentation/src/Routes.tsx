import React, { useState } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { HomePage, QrPage, ResultPage, ScanPage } from "./pages";

export const Routes: React.FC = () => {
  // Allows us to share state between scan and result page
  const [qrCode, setQrCode] = useState<string>();

  const onQrCodeScanned = (scannedQrCode: string): void => {
    setQrCode(scannedQrCode);
  };

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/result">
          <ResultPage qrCode={qrCode} />
        </Route>
        <Route path="/scan">
          <ScanPage onQrCodeScanned={onQrCodeScanned} />
        </Route>
        <Route path="/qr">
          <QrPage />
        </Route>
        <Route path="/">
          <HomePage />
        </Route>
      </Switch>
    </BrowserRouter>
  );
};
