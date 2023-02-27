export interface EncryptMessageReqBody {
  senderDidUrl: string;
  recipientDidUrls: string[];
  payload: any;
}
