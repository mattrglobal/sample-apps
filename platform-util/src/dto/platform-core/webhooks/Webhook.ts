export interface Webhook {
  id: string;
  events: string[];
  url: string;
  disabled: boolean;
}
