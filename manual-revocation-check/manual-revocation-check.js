import base32Decode from "base32-decode";
import { decode as cborDecode } from "cbor-x";
import pako from "pako";
import * as base64 from "@stablelib/base64";

const urlOrCompact = process.argv[2];
const index = process.argv[3];

if (!urlOrCompact) {
  throw new Error("No URL or compact credential provided.");
}

if (!urlOrCompact.startsWith("http") && !urlOrCompact.startsWith("CSC") && !urlOrCompact.startsWith("CSS")) {
  throw new Error("Invalid argument provided. Neither URL, nor encoded compact credential");
}

if (urlOrCompact.startsWith("http") && !index) {
  throw new Error("No index provided for revocation list URL");
}

function toBitArray(input) {
  const bitArray = [];

  for (let byte of input) {
    let bits = byte.toString(2);
    for (let bit of bits) {
      bitArray.push(Number(bit));
    }
  }

  return bitArray;
}

// CWT credentials are base32 encoded CBOR web tokens
// Revocable CWT credentials contain a reference to the
// public revocation list and their index in that list.
function retrieveRevocationUrlFromCompact(compact) {
  const decoded = base32Decode(compact.slice(7), "RFC4648");
  const cwt = cborDecode(Buffer.from(decoded));
  const payload = cborDecode(cwt.value[2]);

  const status = payload["-65537"];
  const index = status["2"];
  const listUrl = status["3"];

  return { listUrl, index };
}

// The public revocation list endpoint for compact credentials
// returns a CBOR web token that includes the gzip compressed
// revocation list as a bitstring.
async function isCompactRevoked(url, index) {
  const response = await fetch(url);
  const bytes = await response.arrayBuffer();

  const cwt = cborDecode(Buffer.from(bytes));
  const payload = cborDecode(cwt.value[2]);

  const compressedList = payload["-65538"];
  const list = pako.ungzip(compressedList);
  const revocationList = toBitArray(list);

  return revocationList[index] === 1;
}

// The public revocation list endpoint for web semantic credentials
// returns a revocation credential that includes the encoded revocation
// list. The list is a base64url encoded and gzip compressed bitstring.
async function isWebSemanticRevoked(url, index) {
  const response = await fetch(url);
  const revocationCredential = await response.json();

  const { encodedList } = revocationCredential.credentialSubject;
  const list = pako.ungzip(base64.decodeURLSafe(encodedList));
  const listBitArray = toBitArray(list);

  return listBitArray[index] === 1;
}


let isRevoked;
if (urlOrCompact.startsWith("CSC") || urlOrCompact.startsWith("CSS")) {
  console.log("Compact Credential provided\n")
  console.log("Decoding compact credential\n")
  const { listUrl, index } = retrieveRevocationUrlFromCompact(urlOrCompact);
  console.log("Fetching revocation list and checking revocation status\n")
  isRevoked = await isCompactRevoked(listUrl, index);
} else if (urlOrCompact.includes("compact")) {
  console.log("Revocation list URL for compact credential provided\n")
  console.log("Fetching revocation list and checking revocation status\n")
  isRevoked = await isCompactRevoked(urlOrCompact, index);
} else if (urlOrCompact.includes("web-semantic")) {
  console.log("Revocation list URL for Web Semantic credential provided\n")
  console.log("Fetching revocation list and checking revocation status\n")
  isRevoked = await isWebSemanticRevoked(urlOrCompact, index);
} else {
  throw new Error("Unknown credential type");
}

console.log(`Revocation Status: ${isRevoked ? "Revoked" : "Not revoked"}`);
