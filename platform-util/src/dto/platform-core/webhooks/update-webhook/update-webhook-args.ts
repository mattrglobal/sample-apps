import { Webhook } from "../Webhook";

export interface UpdateWebhookArgs {
  query: { id: string };
  body: Webhook;
};
