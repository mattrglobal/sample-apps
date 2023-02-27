import {
  UpdateInboxReqQuery,
  UpdateInboxReqBody,
} from '@/dto/platform-core/messaging';

export interface UpdateInboxArgs {
  query: UpdateInboxReqQuery;
  body: UpdateInboxReqBody;
}
