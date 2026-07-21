#!/usr/bin/env node
// Repair Issue.coverImage: scrape real magazine covers from the original
// bodhanam.net archive, mirror them to Spaces, point DB at the CDN copies.
// Usage: node --env-file=.env scripts/fix-covers.mjs [--dry-run]

import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";

const ORIGIN = "https://bodhanam.net";
const DRY_RUN = process.argv.includes("--dry-run");

const {
  DO_SPACES_KEY,
  DO_SPACES_SECRET,
  DO_SPACES_ENDPOINT,
  DO_SPACES_CDN_ENDPOINT,
  DO_SPACES_BUCKET,
  DO_SPACES_FOLDER,
} = process.env;

if (!DO_SPACES_KEY || !DO_SPACES_SECRET || !DO_SPACES_ENDPOINT || !DO_SPACES_CDN_ENDPOINT || !DO_SPACES_BUCKET || !DO_SPACES_FOLDER) {
  console.error("Missing DigitalOcean Spaces configuration");
  process.exit(1);
}

const endpoint = DO_SPACES_ENDPOINT.startsWith("http") ? DO_SPACES_ENDPOINT : `https://${DO_SPACES_ENDPOINT}`;
let cdn = DO_SPACES_CDN_ENDPOINT.startsWith("http") ? DO_SPACES_CDN_ENDPOINT : `https://${DO_SPACES_CDN_ENDPOINT}`;
cdn = cdn.replace(/\/$/, "");

const s3 = new S3Client({
  region: "us-east-1",
  endpoint,
  credentials: { accessKeyId: DO_SPACES_KEY, secretAccessKey: DO_SPACES_SECRET },
});

const db = new PrismaClient();

const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" };

async function existsInSpaces(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: DO_SPACES_BUCKET, Key: key }));
    return true;
  } catch (e) {
    if (e.name === "NotFound") return false;
    throw e;
  }
}

/** issueId -> original cover URL, parsed per <a> card so order never matters */
async function scrapeCovers() {
  const covers = new Map();
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`${ORIGIN}/archives?page=${page}`);
    if (!res.ok) throw new Error(`archives page ${page}: HTTP ${res.status}`);
    const html = await res.text();
    const cardRe = /<a[^>]*href="[^"]*\/issue\/(\d+)"[^>]*>([\s\S]*?)<\/a>/g;
    for (const m of html.matchAll(cardRe)) {
      const id = parseInt(m[1]);
      const img = m[2].match(/<img[^>]*src="([^"]*\/storage\/uploads\/[^"]*)"/);
      if (img && !covers.has(id)) covers.set(id, img[1]);
    }
  }
  return covers;
}

async function main() {
  console.log(`Scraping covers from ${ORIGIN}/archives ...`);
  const covers = await scrapeCovers();
  console.log(`Found ${covers.size} issue covers\n`);

  const issues = await db.issue.findMany({ select: { id: true, coverImage: true } });
  const backup = Object.fromEntries(issues.map((i) => [i.id, i.coverImage]));
  const backupPath = `covers-backup-${new Date().toISOString().slice(0, 10)}.json`;
  writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`Old coverImage values backed up to ${backupPath}\n`);

  let updated = 0, missing = 0, failed = 0;
  for (const issue of issues) {
    const srcUrl = covers.get(issue.id);
    if (!srcUrl) {
      console.log(`[MISS] issue ${issue.id}: no cover on original site`);
      missing++;
      continue;
    }
    try {
      const path = decodeURI(new URL(srcUrl).pathname); // /storage/uploads/...
      const key = `${DO_SPACES_FOLDER}${path}`;
      const cdnUrl = `${cdn}/${DO_SPACES_FOLDER}${encodeURI(path)}`;

      if (DRY_RUN) {
        console.log(`[DRY] issue ${issue.id}: ${srcUrl} -> ${cdnUrl}`);
        continue;
      }

      if (!(await existsInSpaces(key))) {
        const res = await fetch(srcUrl);
        if (!res.ok) throw new Error(`download HTTP ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        const ext = path.split(".").pop().toLowerCase();
        await s3.send(
          new PutObjectCommand({
            Bucket: DO_SPACES_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: MIME[ext] || "application/octet-stream",
            ACL: "public-read",
          })
        );
        console.log(`[UPLOAD] issue ${issue.id}: ${path} (${(buffer.length / 1024).toFixed(0)} KB)`);
      } else {
        console.log(`[EXISTS] issue ${issue.id}: ${path}`);
      }

      await db.issue.update({ where: { id: issue.id }, data: { coverImage: cdnUrl } });
      updated++;
    } catch (e) {
      console.error(`[FAIL] issue ${issue.id}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${missing} without cover, ${failed} failed`);
  await db.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
