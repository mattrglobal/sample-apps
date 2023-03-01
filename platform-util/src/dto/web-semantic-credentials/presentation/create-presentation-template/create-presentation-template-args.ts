import { PresentationTemplateQuery } from "../core";

export interface CreatePresentationTemplateArgs {
  body: {
    domain: string;
    name: string;
    query: PresentationTemplateQuery;
  };
}
