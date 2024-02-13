import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as fs from "node:fs";
import * as path from "node:path";
import { Env } from "./env";

export async function putMp3(filePath: string): Promise<void> {
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${Env.cloudflare.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: Env.cloudflare.accessKeyId,
      secretAccessKey: Env.cloudflare.secretAccessKey,
    },
  });
  const fileName = path.basename(filePath);
  const buf = fs.readFileSync(filePath);
  const putCommand = new PutObjectCommand({
    Bucket: Env.cloudflare.bucketName,
    Key: fileName,
    Body: buf,
  });
  await s3.send(putCommand);

  console.log(`send to r2: ${filePath}`);
}
