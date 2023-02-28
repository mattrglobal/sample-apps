import {
  ResolveDidIon,
  ResolveDidKey,
  ResolveDidWeb,
} from '@/dto/platform-core/dids';

export type ResolveDidReqResponse =
  | ResolveDidKey
  | ResolveDidWeb
  | ResolveDidIon;
