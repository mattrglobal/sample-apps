import { Button } from "@material-ui/core";
import styled from "styled-components";

export const GenericButton = styled(Button)`
  background-color: #0c5a8d;
  borderradius: 4;
  height: 54px;
  padding: 16px 24px;
  width: 116px;
  color: #fff;
  text-transform: none;
  font-size: 16px;
  :hover {
    opacity: 0.7;
    background-color: #0c5a8d;
  }
`;
