import { Webhook } from '@/dto/platform-core/webhooks/Webhook';

export interface GetWebhooksReqResponse {
  data: Webhook[];
  nextCursor?: string;
}
