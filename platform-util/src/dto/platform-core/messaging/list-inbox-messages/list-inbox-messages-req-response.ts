import { Message } from '@/dto/platform-core/messaging/core';

export interface ListInboxMessagesReqResponse {
  data: Message[];
  nextCursor?: string;
}
