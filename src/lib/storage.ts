import { randomUUID } from "node:crypto";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  NotFound,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Works with AWS S3 and any S3-compatible store (Cloudflare R2, MinIO, ...).
// For R2, set S3_ENDPOINT to https://<account-id>.r2.cloudflarestorage.com
// and S3_REGION to "auto".

const DEFAULT_URL_EXPIRY_SECONDS = 60 * 10;
const MAX_DELETE_BATCH = 1000;
const TRAILING_SLASHES = /\/+$/;
const UNSAFE_FILENAME_CHARS = /[^a-zA-Z0-9._-]+/g;

let client: S3Client | undefined;

// Created lazily so builds and pages that never touch storage don't need the env vars.
function getClient() {
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
      // Newer SDKs add CRC32 checksums to every upload by default, which breaks
      // presigned browser uploads and some S3-compatible providers (incl. R2).
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
}

function getBucket(bucket?: string) {
  const name = bucket ?? process.env.S3_BUCKET;
  if (!name) {
    throw new Error("S3_BUCKET is not set");
  }
  return name;
}

export interface UploadOptions {
  bucket?: string;
  cacheControl?: string;
  contentDisposition?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface PresignedUploadOptions extends UploadOptions {
  /** Exact byte size the client must send; signed so it can't be exceeded. */
  contentLength?: number;
  expiresIn?: number;
}

export interface PresignedDownloadOptions {
  bucket?: string;
  /** Forces a download with this filename instead of rendering inline. */
  downloadName?: string;
  expiresIn?: number;
}

export interface StoredFile {
  etag?: string;
  key: string;
  lastModified?: Date;
  size: number;
}

export interface FileInfo extends StoredFile {
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface ListFilesResult {
  files: StoredFile[];
  /** Pass back as `cursor` to fetch the next page; undefined on the last page. */
  nextCursor?: string;
}

/**
 * Builds a collision-free object key, e.g. `avatars/<userId>/<uuid>-photo.png`.
 * Always generate keys server-side — never trust a client-supplied key.
 */
export function createFileKey(filename: string, ...prefix: string[]) {
  const safeName = filename
    .trim()
    .replace(UNSAFE_FILENAME_CHARS, "-")
    .slice(-100);
  return [...prefix, `${randomUUID()}-${safeName}`].join("/");
}

/** Public URL for a key, when the bucket is served via S3_PUBLIC_URL (R2 custom domain, CDN, ...). */
export function getPublicUrl(key: string) {
  const base = process.env.S3_PUBLIC_URL;
  if (!base) {
    throw new Error("S3_PUBLIC_URL is not set — use getDownloadUrl instead");
  }
  return `${base.replace(TRAILING_SLASHES, "")}/${key}`;
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | Blob | string | ReadableStream,
  options: UploadOptions = {}
) {
  const data =
    body instanceof Blob ? new Uint8Array(await body.arrayBuffer()) : body;
  await getClient().send(
    new PutObjectCommand({
      Bucket: getBucket(options.bucket),
      Key: key,
      Body: data,
      ContentType:
        options.contentType ?? (body instanceof Blob ? body.type : undefined),
      CacheControl: options.cacheControl,
      ContentDisposition: options.contentDisposition,
      Metadata: options.metadata,
    })
  );
  return { key };
}

/** Returns the file contents, or null when the key does not exist. */
export async function getFile(key: string, bucket?: string) {
  try {
    const res = await getClient().send(
      new GetObjectCommand({ Bucket: getBucket(bucket), Key: key })
    );
    if (!res.Body) {
      return null;
    }
    return {
      body: Buffer.from(await res.Body.transformToByteArray()),
      contentType: res.ContentType,
      size: res.ContentLength ?? 0,
      metadata: res.Metadata,
    };
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

/** Returns object metadata without downloading it, or null when missing. */
export async function getFileInfo(
  key: string,
  bucket?: string
): Promise<FileInfo | null> {
  try {
    const res = await getClient().send(
      new HeadObjectCommand({ Bucket: getBucket(bucket), Key: key })
    );
    return {
      key,
      size: res.ContentLength ?? 0,
      lastModified: res.LastModified,
      etag: res.ETag,
      contentType: res.ContentType,
      metadata: res.Metadata,
    };
  } catch (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }
}

export async function fileExists(key: string, bucket?: string) {
  return (await getFileInfo(key, bucket)) !== null;
}

/** Deleting a missing key succeeds silently. */
export async function deleteFile(key: string, bucket?: string) {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: getBucket(bucket), Key: key })
  );
}

export async function deleteFiles(keys: string[], bucket?: string) {
  const batches: string[][] = [];
  for (let i = 0; i < keys.length; i += MAX_DELETE_BATCH) {
    batches.push(keys.slice(i, i + MAX_DELETE_BATCH));
  }
  const results = await Promise.all(
    batches.map((batch) =>
      getClient().send(
        new DeleteObjectsCommand({
          Bucket: getBucket(bucket),
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        })
      )
    )
  );
  const failed = results.flatMap((res) => res.Errors ?? []);
  if (failed.length) {
    throw new Error(
      `Failed to delete ${failed.length} file(s): ${failed.map((e) => e.Key).join(", ")}`
    );
  }
}

/** Deletes every object under a prefix, e.g. all of a user's uploads. */
export async function deleteFolder(prefix: string, bucket?: string) {
  let cursor: string | undefined;
  do {
    // biome-ignore lint/performance/noAwaitInLoops: each page needs the previous page's cursor
    const page = await listFiles(prefix, { bucket, cursor });
    await deleteFiles(
      page.files.map((f) => f.key),
      bucket
    );
    cursor = page.nextCursor;
  } while (cursor);
}

export async function listFiles(
  prefix?: string,
  options: { bucket?: string; cursor?: string; limit?: number } = {}
): Promise<ListFilesResult> {
  const res = await getClient().send(
    new ListObjectsV2Command({
      Bucket: getBucket(options.bucket),
      Prefix: prefix,
      ContinuationToken: options.cursor,
      MaxKeys: options.limit,
    })
  );
  return {
    files: (res.Contents ?? []).map((obj) => ({
      key: obj.Key ?? "",
      size: obj.Size ?? 0,
      lastModified: obj.LastModified,
      etag: obj.ETag,
    })),
    nextCursor: res.IsTruncated ? res.NextContinuationToken : undefined,
  };
}

export async function copyFile(
  sourceKey: string,
  destinationKey: string,
  bucket?: string
) {
  const name = getBucket(bucket);
  await getClient().send(
    new CopyObjectCommand({
      Bucket: name,
      Key: destinationKey,
      CopySource: `${name}/${sourceKey.split("/").map(encodeURIComponent).join("/")}`,
    })
  );
  return { key: destinationKey };
}

export async function moveFile(
  sourceKey: string,
  destinationKey: string,
  bucket?: string
) {
  await copyFile(sourceKey, destinationKey, bucket);
  await deleteFile(sourceKey, bucket);
  return { key: destinationKey };
}

/**
 * Presigned PUT URL so the browser uploads straight to the bucket, bypassing
 * the 4.5 MB function body limit. The client must send the same Content-Type
 * (and Content-Length, if set) that was signed:
 *
 *   await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })
 *
 * Browser uploads also need a CORS rule on the bucket allowing PUT from your origin.
 */
export async function getUploadUrl(
  key: string,
  options: PresignedUploadOptions = {}
) {
  const url = await getSignedUrl(
    getClient(),
    new PutObjectCommand({
      Bucket: getBucket(options.bucket),
      Key: key,
      ContentType: options.contentType,
      ContentLength: options.contentLength,
      CacheControl: options.cacheControl,
      ContentDisposition: options.contentDisposition,
      Metadata: options.metadata,
    }),
    { expiresIn: options.expiresIn ?? DEFAULT_URL_EXPIRY_SECONDS }
  );
  return { url, key };
}

/** Temporary GET URL for a private object. */
export function getDownloadUrl(
  key: string,
  options: PresignedDownloadOptions = {}
) {
  return getSignedUrl(
    getClient(),
    new GetObjectCommand({
      Bucket: getBucket(options.bucket),
      Key: key,
      ResponseContentDisposition: options.downloadName
        ? `attachment; filename="${options.downloadName.replace(/"/g, "")}"`
        : undefined,
    }),
    { expiresIn: options.expiresIn ?? DEFAULT_URL_EXPIRY_SECONDS }
  );
}

function isNotFound(error: unknown) {
  return (
    error instanceof NotFound ||
    (error instanceof Error &&
      (error.name === "NoSuchKey" || error.name === "NotFound"))
  );
}
