import { PresentationTemplate } from "../core";

export interface UpdatePresentationTemplateArgs {
  query: { id: string };
  body: PresentationTemplate;
};
