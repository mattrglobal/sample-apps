import { CreateInboxReqResponse } from '@/dto/platform-core/messaging/create-inbox';

export interface ListInboxesReqResponse {
  data: CreateInboxReqResponse[];
  nextCursor?: string;
}
