import base32Decode from "base32-decode";
import { inflate } from "pako";

export const decodeQrCode = (qrCode: string): Uint8Array => inflate(new Uint8Array(base32Decode(qrCode, "RFC4648")));
