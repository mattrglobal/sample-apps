import {
  UnregisterDidWithinInboxReqQuery,
  UnregisterDidWithinInboxReqBody,
} from '@/dto/platform-core/messaging';

export interface UnregisterDidWithinInboxArgs {
  query: UnregisterDidWithinInboxReqQuery;
  body: UnregisterDidWithinInboxReqBody;
}
