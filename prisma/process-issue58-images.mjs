#!/usr/bin/env node

/**
 * Process Issue 58 article images: download from bodhanam.net, convert to webp, upload to DO Spaces.
 * Updates MongoDB with CDN URLs.
 */

import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const prisma = new PrismaClient();

// Load env vars
const {
  DO_SPACES_KEY,
  DO_SPACES_SECRET,
  DO_SPACES_ENDPOINT,
  DO_SPACES_CDN_ENDPOINT,
  DO_SPACES_BUCKET,
  DO_SPACES_FOLDER,
} = process.env;

if (
  !DO_SPACES_KEY ||
  !DO_SPACES_SECRET ||
  !DO_SPACES_ENDPOINT ||
  !DO_SPACES_CDN_ENDPOINT ||
  !DO_SPACES_BUCKET ||
  !DO_SPACES_FOLDER
) {
  console.error("Missing DigitalOcean Spaces configuration");
  process.exit(1);
}

// Normalize endpoints
let endpoint = DO_SPACES_ENDPOINT;
if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
  endpoint = `https://${endpoint}`;
}

let cdnEndpoint = DO_SPACES_CDN_ENDPOINT;
if (!cdnEndpoint.startsWith("http://") && !cdnEndpoint.startsWith("https://")) {
  cdnEndpoint = `https://${cdnEndpoint}`;
}
if (cdnEndpoint.endsWith("/")) {
  cdnEndpoint = cdnEndpoint.slice(0, -1);
}

// Initialize S3 client
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint,
  credentials: {
    accessKeyId: DO_SPACES_KEY,
    secretAccessKey: DO_SPACES_SECRET,
  },
  forcePathStyle: false,
});

const MIME_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

async function fileExistsInSpaces(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: DO_SPACES_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
}

async function uploadToSpaces(key, buffer, contentType) {
  const command = new PutObjectCommand({
    Bucket: DO_SPACES_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType || "application/octet-stream",
    ACL: "public-read",
  });
  await s3Client.send(command);
}

function getCdnUrl(key) {
  return `${cdnEndpoint}/${key}`;
}

async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`    Download failed: ${url} (${response.status})`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.warn(`    Download error: ${error.message}`);
    return null;
  }
}

async function convertToWebp(buffer) {
  try {
    return await sharp(buffer).webp({ quality: 80 }).toBuffer();
  } catch (error) {
    console.warn(`    WebP conversion error: ${error.message}`);
    return null;
  }
}

async function processAndUploadImage(imageUrl, destPath) {
  try {
    // Download
    const buffer = await downloadImage(imageUrl);
    if (!buffer) return null;

    // Check if exists
    const spaceKey = `${DO_SPACES_FOLDER}/${destPath}`;
    const exists = await fileExistsInSpaces(spaceKey);
    if (exists) {
      console.log(`    ✓ Already in Spaces: ${destPath}`);
      return getCdnUrl(spaceKey);
    }

    // Convert to webp
    let finalBuffer = buffer;
    let finalPath = destPath;
    const ext = imageUrl.substring(imageUrl.lastIndexOf(".")).toLowerCase();

    if (![".webp"].includes(ext)) {
      const webpBuf = await convertToWebp(buffer);
      if (!webpBuf) return null;
      finalBuffer = webpBuf;
      finalPath = destPath.replace(/\.[^/.]+$/, ".webp");
    }

    // Upload
    const mimeType = MIME_TYPES[".webp"] || "image/webp";
    await uploadToSpaces(spaceKey.replace(/\.[^/.]+$/, ".webp"), finalBuffer, mimeType);

    const cdnUrl = getCdnUrl(`${DO_SPACES_FOLDER}/${finalPath}`);
    console.log(`    ✓ Uploaded: ${finalPath}`);
    return cdnUrl;
  } catch (error) {
    console.error(`    ✗ Error: ${error.message}`);
    return null;
  }
}

async function processSrcRefsInHtml(htmlContent) {
  let modified = htmlContent;
  const srcPattern = /src="([^"]*storage\/uploads\/[^"]*)"/g;
  const matches = [...htmlContent.matchAll(srcPattern)];

  for (const match of matches) {
    const relPath = match[1];
    const fullUrl = relPath.startsWith("http")
      ? relPath
      : `https://bodhanam.net/${relPath}`;

    console.log(`    Processing src: ${relPath}`);
    const cdnUrl = await processAndUploadImage(fullUrl, relPath);

    if (cdnUrl) {
      modified = modified.replace(
        `src="${relPath}"`,
        `src="${cdnUrl}"`
      );
    }
  }

  return modified;
}

async function processIssue58Images() {
  console.log("🔄 Processing Issue 58 article images...\n");

  try {
    // Fetch Issue 58 articles
    const articles = await prisma.article.findMany({
      where: { issueId: 58 },
    });

    console.log(`Found ${articles.length} Issue 58 articles\n`);

    for (const article of articles) {
      console.log(`Article ${article.id}: ${article.title}`);

      // Process coverImage
      if (article.coverImage) {
        const relPath = article.coverImage.trim();
        if (relPath && !relPath.startsWith("http")) {
          console.log(`  Processing cover image: ${relPath}`);
          const fullUrl = `https://bodhanam.net/storage/uploads/${relPath}`;
          const cdnUrl = await processAndUploadImage(fullUrl, `storage/uploads/${relPath}`);

          if (cdnUrl) {
            await prisma.article.update({
              where: { id: article.id },
              data: { coverImage: cdnUrl },
            });
            console.log(`  ✓ Updated coverImage to CDN URL`);
          } else {
            await prisma.article.update({
              where: { id: article.id },
              data: { coverImage: null },
            });
            console.log(`  ✓ Set coverImage to null (failed download)`);
          }
        }
      }

      // Process bodyHtml src refs
      if (article.bodyHtml && article.bodyHtml.includes("storage/uploads/")) {
        console.log(`  Processing bodyHtml src refs...`);
        const updatedHtml = await processSrcRefsInHtml(article.bodyHtml);
        if (updatedHtml !== article.bodyHtml) {
          await prisma.article.update({
            where: { id: article.id },
            data: { bodyHtml: updatedHtml },
          });
          console.log(`  ✓ Updated bodyHtml with CDN URLs`);
        }
      }

      console.log("");
    }

    console.log("✅ Image processing completed!\n");
  } catch (error) {
    console.error("\n❌ Image processing failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

processIssue58Images().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
