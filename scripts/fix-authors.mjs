#!/usr/bin/env node
// Repair Article.author where the recovery import stored the CATEGORY name
// (ഖുര്‍ആന്‍, ചോദ്യോത്തരം, ബുക് ഷെല്‍ഫ്‌...) instead of the real author.
// Scrapes authors from the original bodhanam.net issue pages (per-card,
// author div and article link must sit in the same <article> block).
// Usage: node --env-file=.env scripts/fix-authors.mjs [--dry-run]

import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";

const ORIGIN = "https://bodhanam.net";
const DRY_RUN = process.argv.includes("--dry-run");
const db = new PrismaClient();

const norm = (s) =>
  s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#039;|&quot;|&amp;/g, (m) => ({ "&nbsp;": " ", "&#039;": "'", "&quot;": '"', "&amp;": "&" }[m]))
    .replace(/[‌‍]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const issues = await db.issue.findMany({ where: { published: true }, select: { id: true } });
const siteAuthors = new Map();
for (const { id } of issues) {
  const html = await (await fetch(`${ORIGIN}/issue/${id}`)).text();
  for (const block of html.split(/<article\b/).slice(1)) {
    const card = block.split("</article>")[0];
    const link = card.match(/\/articles\/show\/(\d+)/);
    const author = card.match(/<div class="author">([\s\S]*?)<\/div>/);
    if (link && author) {
      const aid = parseInt(link[1]);
      const name = norm(author[1]);
      if (name && !siteAuthors.has(aid)) siteAuthors.set(aid, name);
    }
  }
}
console.log(`site authors scraped: ${siteAuthors.size}`);

const ours = await db.article.findMany({ select: { id: true, author: true } });
const diffs = [];
for (const a of ours) {
  const s = siteAuthors.get(a.id);
  if (s && norm(a.author || "") !== s) diffs.push({ id: a.id, old: a.author, new: s });
}
console.log(`authors differing from site: ${diffs.length}`);

const backupPath = "authors-backup.json";
writeFileSync(backupPath, JSON.stringify(diffs, null, 1));
console.log(`old values backed up to ${backupPath}`);

for (const d of diffs) {
  if (DRY_RUN) {
    console.log(`[DRY] ${d.id}: "${d.old}" -> "${d.new}"`);
    continue;
  }
  await db.article.update({ where: { id: d.id }, data: { author: d.new } });
  console.log(`[FIXED] ${d.id}: "${d.old}" -> "${d.new}"`);
}

await db.$disconnect();
