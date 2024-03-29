import { RecRadikoError } from "./rec-radiko-error";

type AuthToken = string;

//   Define authorize key value (from http://radiko.jp/apps/js/playerCommon.js)
const RADIKO_AUTHKEY_VALUE = "bcd151073c03b352e1ef2fd66c32209da9ca0afa";

type Auth1Headers = {
  authToken: string;
  keyOffset: string;
  keyLength: string;
};

export async function authorize(): Promise<AuthToken> {
  // Authorize 1
  const auth1Response = await fetch("https://radiko.jp/v2/api/auth1", {
    headers: {
      "X-Radiko-App": "pc_html5",
      "X-Radiko-App-Version": "0.0.1",
      "X-Radiko-Device": "pc",
      "X-Radiko-User": "dummy_user",
    },
  });
  console.debug("Auth1 response headers", auth1Response.headers);

  const headerEntries: [string, string][] = [];
  auth1Response.headers.forEach((value, key) => {
    headerEntries.push([key, value]);
  });
  const auth1Headers = headerEntries.reduce<Partial<Auth1Headers>>(
    (acc, [key, value]) => {
      if (key.toLowerCase() === "x-radiko-authtoken") {
        acc.authToken = value;
      }
      if (key.toLowerCase() === "x-radiko-keyoffset") {
        acc.keyOffset = value;
      }
      if (key.toLowerCase() === "x-radiko-keylength") {
        acc.keyLength = value;
      }
      return acc;
    },
    {},
  );
  if (
    auth1Headers.authToken === undefined ||
    auth1Headers.keyOffset === undefined ||
    auth1Headers.keyLength === undefined
  ) {
    console.error(auth1Headers);
    throw new RecRadikoError("auth1 response is invalid");
  }
  const keyOffset = parseInt(auth1Headers.keyOffset, 10);
  const keyLength = parseInt(auth1Headers.keyLength, 10);
  if (Number.isNaN(keyOffset) || Number.isNaN(keyLength)) {
    console.error({ keyOffset, keyLength });
    throw new RecRadikoError("keyOffset or keyLength is not a number");
  }

  const partialKey = Buffer.from(
    RADIKO_AUTHKEY_VALUE.substring(keyOffset, keyOffset + keyLength),
  ).toString("base64");

  // # Authorize 2
  const auth2Response = await fetch("https://radiko.jp/v2/api/auth2", {
    headers: {
      "X-Radiko-Device": "pc",
      "X-Radiko-User": "dummy_user",
      "X-Radiko-AuthToken": auth1Headers.authToken,
      "X-Radiko-PartialKey": partialKey,
    },
  });
  console.debug("Auth2 response headers", auth2Response.headers);
  if (!auth2Response.ok) {
    console.error(auth2Response);
    throw new RecRadikoError("auth2 response is not ok");
  }

  return auth1Headers.authToken;
}
