import { Pagination } from '@/dto/common';

export interface ListInboxDidsReqQuery {
  inboxId: string;
  pagination?: Pagination;
}
