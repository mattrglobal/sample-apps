import base32Decode from "base32-decode";
import { ungzip } from "pako";

export const decodeQrCode = (qrCode: string): Uint8Array => ungzip(new Uint8Array(base32Decode(qrCode, "RFC4648")));
