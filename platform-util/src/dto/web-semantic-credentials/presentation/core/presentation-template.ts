import { PresentationTemplateQuery } from "./presentation-template-query";

export interface PresentationTemplate {
  id: string;
  domain: string;
  name: string;
  query: PresentationTemplateQuery;
}