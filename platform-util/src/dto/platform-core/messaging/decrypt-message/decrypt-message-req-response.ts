export interface DecryptMessageReqResponse {
  payload: string;
  senderDidUrl: string;
  senderPublicJwk: any;
  recipientDidUrl: string;
}
