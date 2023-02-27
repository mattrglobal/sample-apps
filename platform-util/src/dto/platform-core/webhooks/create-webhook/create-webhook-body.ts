export type IEvent = 'OidcIssuerCredentialIssued' | string;
export interface CreateWebhookBody {
  events: IEvent[];
  url: string;
  disabled?: boolean;
}
