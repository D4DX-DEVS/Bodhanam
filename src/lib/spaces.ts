import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

/**
 * Check if all required DigitalOcean Spaces environment variables are present
 */
export function spacesEnabled(): boolean {
  return !!(
    process.env.DO_SPACES_KEY &&
    process.env.DO_SPACES_SECRET &&
    process.env.DO_SPACES_ENDPOINT &&
    process.env.DO_SPACES_CDN_ENDPOINT &&
    process.env.DO_SPACES_BUCKET &&
    process.env.DO_SPACES_FOLDER
  );
}

/**
 * Create and return a configured S3Client for DigitalOcean Spaces
 */
function getSpacesClient(): S3Client {
  if (!spacesEnabled()) {
    throw new Error("DigitalOcean Spaces not configured");
  }

  // Normalize endpoint to include https:// if missing
  let endpoint = process.env.DO_SPACES_ENDPOINT!;
  if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
    endpoint = `https://${endpoint}`;
  }

  return new S3Client({
    region: "us-east-1",
    endpoint,
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY!,
      secretAccessKey: process.env.DO_SPACES_SECRET!,
    },
    forcePathStyle: false,
  });
}

/**
 * Upload a file to DigitalOcean Spaces
 * @param key Full S3 key (e.g., "folder/uploads/image.webp")
 * @param buffer File contents as Buffer
 * @param contentType MIME type (e.g., "image/webp")
 */
export async function uploadToSpaces(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const client = getSpacesClient();

  const command = new PutObjectCommand({
    Bucket: process.env.DO_SPACES_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: "public-read",
  });

  await client.send(command);
}

/**
 * Check if a file already exists in Spaces
 */
export async function fileExistsInSpaces(key: string): Promise<boolean> {
  const client = getSpacesClient();

  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET!,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (error: unknown) {
    const err = error as { name?: string };
    if (err.name === "NotFound") {
      return false;
    }
    throw error;
  }
}

/**
 * Generate CDN URL for a file in Spaces
 * @param key Full S3 key (e.g., "folder/uploads/image.webp")
 * @returns Absolute CDN URL
 */
export function cdnUrl(key: string): string {
  let endpoint = process.env.DO_SPACES_CDN_ENDPOINT!;

  // Normalize endpoint to include https:// if missing
  if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
    endpoint = `https://${endpoint}`;
  }

  // Ensure no double slashes
  if (endpoint.endsWith("/")) {
    endpoint = endpoint.slice(0, -1);
  }

  return `${endpoint}/${key}`;
}
