#!/usr/bin/env node

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.substring(
  0,
  Math.max(
    __filename.lastIndexOf("/"),
    __filename.lastIndexOf("\\")
  )
);
const projectRoot = join(__dirname, "..");

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

// Initialize Prisma
const prisma = new PrismaClient();

// MIME type map
const MIME_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

/**
 * Generate CDN URL for a key
 */
function getCdnUrl(key) {
  return `${cdnEndpoint}/${key}`;
}

/**
 * Check if file exists in Spaces
 */
async function fileExistsInSpaces(key) {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: DO_SPACES_BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    if (error.name === "NotFound") {
      return false;
    }
    throw error;
  }
}

/**
 * Upload file to Spaces
 */
async function uploadFile(key, filePath) {
  const buffer = readFileSync(filePath);
  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  await s3Client.send(
    new PutObjectCommand({
      Bucket: DO_SPACES_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );
}

/**
 * Recursively find all image files
 */
function findImageFiles(dirPath) {
  const files = [];
  const imageExtensions = /\.(webp|jpg|jpeg|png|gif)$/i;

  function walk(currentPath) {
    try {
      const items = readdirSync(currentPath);
      for (const item of items) {
        const fullPath = join(currentPath, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (imageExtensions.test(fullPath)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error.message);
    }
  }

  walk(dirPath);
  return files;
}

/**
 * Get site-relative path (e.g., "/storage/uploads/file.webp")
 */
function getSiteRelativePath(filePath) {
  const publicIndex = filePath.indexOf("public");
  if (publicIndex === -1) return null;
  const relativePath = filePath.substring(publicIndex + 6); // Remove "public"
  const normalized = relativePath.replace(/\\/g, "/");
  // Ensure single leading slash
  return normalized.startsWith("/") ? normalized : "/" + normalized;
}

/**
 * Replace image URLs in HTML
 */
function replaceImageUrlsInHtml(html, urlMap) {
  let updated = html;

  // Replace all image src URLs
  // Match: src="/storage/..." or src="/images/..." or src='...'
  const srcRegex =
    /src=["']([^"']*(?:\/storage\/|\/images\/)[^"']*\.(?:webp|jpg|jpeg|png|gif))["']/gi;

  updated = updated.replace(srcRegex, (match, url) => {
    const normalizedUrl = url.startsWith("/") ? url : "/" + url;
    if (urlMap[normalizedUrl]) {
      return `src="${urlMap[normalizedUrl]}"`;
    }
    return match;
  });

  return updated;
}

/**
 * Main script
 */
async function main() {
  console.log("Starting image upload to DigitalOcean Spaces...\n");

  const stats = {
    uploaded: 0,
    skipped: 0,
    failed: 0,
    totalBytes: 0,
    failedFiles: [],
  };

  // Find all image files
  const storagePath = join(projectRoot, "public", "storage");
  const imagesPath = join(projectRoot, "public", "images");

  const storageFiles = findImageFiles(storagePath);
  const imageFiles = findImageFiles(imagesPath);
  const allFiles = [...storageFiles, ...imageFiles];

  console.log(`Found ${allFiles.length} image files to process\n`);

  // Upload files and build URL map
  const urlMap = {}; // Maps site-relative path to CDN URL

  for (const filePath of allFiles) {
    try {
      const siteRelativePath = getSiteRelativePath(filePath);
      if (!siteRelativePath) continue;

      const spaceKey = `${DO_SPACES_FOLDER}${siteRelativePath}`;

      // Check if already exists
      const exists = await fileExistsInSpaces(spaceKey);
      if (exists) {
        console.log(`[SKIP] ${siteRelativePath}`);
        stats.skipped++;
        urlMap[siteRelativePath] = getCdnUrl(spaceKey);
        continue;
      }

      // Upload
      await uploadFile(spaceKey, filePath);
      const stat = statSync(filePath);
      stats.totalBytes += stat.size;
      stats.uploaded++;
      urlMap[siteRelativePath] = getCdnUrl(spaceKey);
      console.log(`[UPLOAD] ${siteRelativePath}`);
    } catch (error) {
      stats.failed++;
      stats.failedFiles.push({
        file: filePath,
        error: error.message,
      });
      console.error(`[FAIL] ${filePath}: ${error.message}`);
    }
  }

  console.log(
    `\nUpload complete: ${stats.uploaded} uploaded, ${stats.skipped} skipped, ${stats.failed} failed`
  );
  console.log(
    `Total bytes uploaded: ${(stats.totalBytes / (1024 * 1024)).toFixed(2)} MB\n`
  );

  // Update database references
  console.log("Updating database references...\n");

  const dbStats = {
    issuesUpdated: 0,
    articlesUpdated: 0,
    pagesUpdated: 0,
  };

  try {
    // Update Issue.coverImage
    const issues = await prisma.issue.findMany({
      where: {
        coverImage: { not: null },
      },
    });

    for (const issue of issues) {
      if (issue.coverImage && urlMap[issue.coverImage]) {
        await prisma.issue.update({
          where: { id: issue.id },
          data: {
            coverImage: urlMap[issue.coverImage],
          },
        });
        dbStats.issuesUpdated++;
        console.log(`Updated Issue ${issue.id} coverImage`);
      }
    }

    // Update Article.coverImage
    const articles = await prisma.article.findMany({
      where: {
        coverImage: { not: null },
      },
    });

    for (const article of articles) {
      if (article.coverImage && urlMap[article.coverImage]) {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            coverImage: urlMap[article.coverImage],
          },
        });
        dbStats.articlesUpdated++;
        console.log(`Updated Article ${article.id} coverImage`);
      }
    }

    // Update Article.bodyHtml for embedded images
    const allArticles = await prisma.article.findMany();
    for (const article of allArticles) {
      const updated = replaceImageUrlsInHtml(article.bodyHtml, urlMap);
      if (updated !== article.bodyHtml) {
        await prisma.article.update({
          where: { id: article.id },
          data: {
            bodyHtml: updated,
          },
        });
        dbStats.articlesUpdated++;
        console.log(`Updated Article ${article.id} bodyHtml images`);
      }
    }

    // Update Page.bodyHtml for embedded images
    const allPages = await prisma.page.findMany();
    for (const page of allPages) {
      const updated = replaceImageUrlsInHtml(page.bodyHtml, urlMap);
      if (updated !== page.bodyHtml) {
        await prisma.page.update({
          where: { slug: page.slug },
          data: {
            bodyHtml: updated,
          },
        });
        dbStats.pagesUpdated++;
        console.log(`Updated Page ${page.slug} bodyHtml images`);
      }
    }
  } catch (error) {
    console.error("Database update error:", error.message);
  }

  console.log(
    `\nDatabase updates: ${dbStats.issuesUpdated} issues, ${dbStats.articlesUpdated} articles, ${dbStats.pagesUpdated} pages`
  );

  if (stats.failedFiles.length > 0) {
    console.log("\nFailed files:");
    stats.failedFiles.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  await prisma.$disconnect();
  process.exit(stats.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
