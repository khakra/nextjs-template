import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

// Configure the AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
  requestHandler: {
    // Set timeouts for S3 operations
    timeoutInMs: 500000, // 5 minutes
  },
  maxAttempts: 3, // Built-in retry mechanism
});

// Function to convert a ReadableStream to a Buffer
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();
  let result = await reader.read();
  while (!result.done) {
    chunks.push(result.value);
    result = await reader.read();
  }
  return Buffer.concat(chunks);
}

// Function to upload an image from URL to S3
export async function UploadImageToS3(imageUrl: string) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const contentType = response.headers.get("content-type");
    if (!response.ok || response.body === null) {
      throw new Error("Failed to fetch image");
    }
    const imageBuffer = await streamToBuffer(response.body);
    const imgName = nanoid();

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `output/${imgName}.jpg`,
      Body: imageBuffer,
      ContentType: contentType || "application/octet-stream",
    };
    const command = new PutObjectCommand(uploadParams);
    const uploadResult = await s3Client.send(command);
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/output/${imgName}.jpg`;
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}
