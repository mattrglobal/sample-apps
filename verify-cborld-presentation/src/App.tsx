import React from "react";
import styled from "styled-components";

import { Routes } from "./Routes";

export const App = (): React.ReactElement => {
  return (
    <Container>
      <Nav>
        <Logo src="./static/mattr-logo.svg" />
      </Nav>
      <Content>
        <Routes />
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
