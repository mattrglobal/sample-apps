import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import styled from "styled-components";

import { HomePage, ScanPage, ResultPage, QrPage } from "./pages";

export const App = (): React.ReactElement => {
  const [qrCode, setQrCode] = useState<string>();

  const onQrCodeChange = (scannedQrCode: string): void => {
    setQrCode(scannedQrCode);
  };

  return (
    <Container>
      <Nav>
        <Logo src="./static/mattr-logo.svg" />
      </Nav>
      <Content>
        <Router>
          <div>
            <Switch>
              <Route path="/result">
                <ResultPage qrCode={qrCode} />
              </Route>
              <Route path="/scan">
                <ScanPage onScannedQrCodeChange={onQrCodeChange} />
              </Route>
              <Route path="/qr">
                <QrPage />
              </Route>
              <Route path="/">
                <HomePage />
              </Route>
            </Switch>
          </div>
        </Router>
      </Content>
    </Container>
  );
};

const Content = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 24px 12px 24px;
`;
const Nav = styled.div`
  background-color: #333132;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  color: #404344;
  font-family: "TT Commons MATTR", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",
    "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-feature-settings: "liga" on;
`;

const Logo = styled.img`
  height: 20px;
`;

export default App;
