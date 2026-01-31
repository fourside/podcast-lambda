import { RecRadikoError } from "./rec-radiko-error";
import type { AuthResult } from "./type";

//   Define authorize key value (from http://radiko.jp/apps/js/playerCommon.js)
const RADIKO_AUTHKEY_VALUE = "bcd151073c03b352e1ef2fd66c32209da9ca0afa";

export async function authorize(): Promise<AuthResult> {
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

  const authToken = auth1Response.headers.get("x-radiko-authtoken");
  const keyOffsetStr = auth1Response.headers.get("x-radiko-keyoffset");
  const keyLengthStr = auth1Response.headers.get("x-radiko-keylength");
  if (authToken === null || keyOffsetStr === null || keyLengthStr === null) {
    console.error({ authToken, keyOffsetStr, keyLengthStr });
    throw new RecRadikoError("auth1 response is invalid");
  }
  const keyOffset = parseInt(keyOffsetStr, 10);
  const keyLength = parseInt(keyLengthStr, 10);
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
      "X-Radiko-AuthToken": authToken,
      "X-Radiko-PartialKey": partialKey,
    },
  });
  console.debug("Auth2 response headers", auth2Response.headers);
  if (!auth2Response.ok) {
    console.error(auth2Response);
    throw new RecRadikoError("auth2 response is not ok");
  }

  // auth2 response body format: "JP13,tokyo,tokyo\n"
  const auth2Body = await auth2Response.text();
  console.debug("Auth2 response body", auth2Body);
  const areaId = auth2Body.split(",")[0]?.trim();
  if (!areaId) {
    throw new RecRadikoError("auth2 response does not contain area_id");
  }

  return { authToken, areaId };
}
