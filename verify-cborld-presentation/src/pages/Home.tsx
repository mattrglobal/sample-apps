import { Box, Link, StylesProvider } from "@material-ui/core";
import React from "react";
import styled from "styled-components";

import { Description, DescriptionTitle, GenericButton } from "../components";

export const HomePage: React.FC = () => {
  return (
    <HomePageStyled>
      <div>
        <DescriptionTitle>Scan</DescriptionTitle>
        <Description>You can easily and securely authenticate by scanning QR codes.</Description>
      </div>
      <Box display="flex" justifyContent="center" mt={9}>
        <StylesProvider injectFirst>
          <Link component={GenericButton} href="/scan">
            Scan
          </Link>
        </StylesProvider>
      </Box>
    </HomePageStyled>
  );
};

const HomePageStyled = styled.div`
  padding: 32px 0;
`;
