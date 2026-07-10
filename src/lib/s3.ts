import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

export const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "us-west-2",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_S3_SECRET_KEY || "",
  },
  requestHandler: {
    timeoutInMs: 500_000,
  },
  maxAttempts: 3,
});

const TRAILING_SLASH_REGEX = /\/$/;

function publicUrlForKey(key: string) {
  const bucketUrl =
    process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL ||
    `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com`;
  return `${bucketUrl.replace(TRAILING_SLASH_REGEX, "")}/${key}`;
}

// Uploads an in-memory file to S3 and returns its public URL. Callers are
// responsible for fetching/validating the bytes — this module never fetches
// URLs itself, so user input can't be used to reach internal services (SSRF).
export async function uploadFileToS3({
  body,
  contentType,
  extension,
  keyPrefix = "uploads",
}: {
  body: Buffer | Uint8Array;
  contentType: string;
  extension: string;
  keyPrefix?: string;
}) {
  const key = `${keyPrefix}/${nanoid()}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "",
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return publicUrlForKey(key);
}
