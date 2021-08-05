import { Got } from "got";

export type PresentationRef = string;
export type ParsedPresentationResult = {
  subjectDid: string;
};

export type RequestContext = {
  tenant: string;
  bundleId: string;
  ngrokUrl: string;
  api: Got;
};

declare module "express-serve-static-core" {
  export interface Request {
    context: RequestContext;
  }
}
