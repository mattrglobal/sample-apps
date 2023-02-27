import { Pagination } from '@/dto/common';

export interface ListInboxMessagesReqQuery {
  inboxId: string;
  pagination?: Pagination;
}
