#!/usr/bin/env node

import sharp from "sharp";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const SKIP_FILES = ["icon.png", "logo1.png", "logo-light.png"];
const IMAGE_DIRS = [
  path.join(__dirname, "../public/storage"),
  path.join(__dirname, "../public/images"),
];

let convertedCount = 0;
let totalSizeBefore = 0;
let totalSizeAfter = 0;

async function getFilesRecursive(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await getFilesRecursive(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function convertImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) {
    return false;
  }

  const fileName = path.basename(inputPath);
  if (SKIP_FILES.includes(fileName)) {
    return false;
  }

  const outputPath = inputPath.replace(/\.[^/.]+$/, ".webp");

  if (fs.existsSync(outputPath)) {
    return false; // Already converted
  }

  try {
    const inputSize = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);

    const outputSize = fs.statSync(outputPath).size;
    totalSizeBefore += inputSize;
    totalSizeAfter += outputSize;
    convertedCount++;

    console.log(
      `✓ Converted: ${path.relative(process.cwd(), inputPath)} (${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB)`
    );

    return true;
  } catch (error) {
    console.error(`✗ Error converting ${inputPath}:`, error.message);
    return false;
  }
}

async function updateDatabase() {
  console.log("\nUpdating database references...");

  // Update Issue.coverImage
  const issues = await prisma.issue.findMany({
    where: {
      coverImage: {
        not: null,
      },
    },
  });

  for (const issue of issues) {
    if (issue.coverImage && !issue.coverImage.endsWith(".webp")) {
      const webpPath = issue.coverImage.replace(/\.[^/.]+$/, ".webp");
      const fullPath = path.join(__dirname, "../public", webpPath);

      if (fs.existsSync(fullPath)) {
        await prisma.issue.update({
          where: { id: issue.id },
          data: { coverImage: webpPath },
        });
        console.log(`✓ Updated Issue ${issue.id} coverImage to WebP`);
      }
    }
  }

  // Update Article.coverImage
  const articles = await prisma.article.findMany({
    where: {
      coverImage: {
        not: null,
      },
    },
  });

  for (const article of articles) {
    if (article.coverImage && !article.coverImage.endsWith(".webp")) {
      const webpPath = article.coverImage.replace(/\.[^/.]+$/, ".webp");
      const fullPath = path.join(__dirname, "../public", webpPath);

      if (fs.existsSync(fullPath)) {
        await prisma.article.update({
          where: { id: article.id },
          data: { coverImage: webpPath },
        });
        console.log(`✓ Updated Article ${article.id} coverImage to WebP`);
      }
    }
  }

  // Update Article.bodyHtml image references
  const allArticles = await prisma.article.findMany();
  for (const article of allArticles) {
    if (article.bodyHtml && article.bodyHtml.includes("<img")) {
      let updatedBody = article.bodyHtml;
      const imgRegex = /src="([^"]+\.(jpg|jpeg|png))"/gi;

      let hasChanges = false;
      updatedBody = updatedBody.replace(imgRegex, (match, imagePath) => {
        const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, ".webp");
        const fullPath = path.join(__dirname, "../public", webpPath);

        if (fs.existsSync(fullPath)) {
          hasChanges = true;
          return `src="${webpPath}"`;
        }
        return match;
      });

      if (hasChanges) {
        await prisma.article.update({
          where: { id: article.id },
          data: { bodyHtml: updatedBody },
        });
        console.log(`✓ Updated Article ${article.id} bodyHtml images to WebP`);
      }
    }
  }

  // Update Page.bodyHtml image references
  const pages = await prisma.page.findMany();

  for (const page of pages) {
    if (page.bodyHtml && page.bodyHtml.includes("<img")) {
      let updatedBody = page.bodyHtml;
      const imgRegex = /src="([^"]+\.(jpg|jpeg|png))"/gi;

      let hasChanges = false;
      updatedBody = updatedBody.replace(imgRegex, (match, imagePath) => {
        const webpPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, ".webp");
        const fullPath = path.join(__dirname, "../public", webpPath);

        if (fs.existsSync(fullPath)) {
          hasChanges = true;
          return `src="${webpPath}"`;
        }
        return match;
      });

      if (hasChanges) {
        await prisma.page.update({
          where: { id: page.id },
          data: { bodyHtml: updatedBody },
        });
        console.log(`✓ Updated Page ${page.id} bodyHtml images to WebP`);
      }
    }
  }
}

async function main() {
  console.log("Starting WebP conversion...\n");

  for (const dir of IMAGE_DIRS) {
    if (!fs.existsSync(dir)) {
      console.log(`Skipping non-existent directory: ${dir}`);
      continue;
    }

    console.log(`Processing directory: ${dir}`);
    const files = await getFilesRecursive(dir);

    for (const file of files) {
      await convertImage(file);
    }
  }

  await updateDatabase();

  const savedSize = totalSizeBefore - totalSizeAfter;
  const savings = totalSizeBefore > 0 ? ((savedSize / totalSizeBefore) * 100).toFixed(1) : 0;

  console.log("\n========== CONVERSION SUMMARY ==========");
  console.log(`Total images converted: ${convertedCount}`);
  console.log(`Total size before: ${(totalSizeBefore / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Total size after:  ${(totalSizeAfter / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Size saved: ${(savedSize / 1024 / 1024).toFixed(2)}MB (${savings}%)`);
  console.log("========================================");

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
