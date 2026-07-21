// Seed the DB from the scraped JSON. Idempotent: wipes content tables and re-imports.
// Run: node --env-file=.env prisma/import.mjs
import { PrismaClient } from "@prisma/client";
import { readFile, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import bcrypt from "bcryptjs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DATA = path.join(ROOT, "data");
const MEDIA = path.join(ROOT, "media");
const PUBLIC = path.resolve(__dirname, "../public");

const prisma = new PrismaClient();
// Rewrite absolute old-site asset URLs to site-relative so copied media resolves.
const rel = (u) => (u ? u.replace(/https?:\/\/(www\.)?bodhanam\.net\//g, "/") : u);
// A usable image points at an actual file (not the bare /storage/uploads/ stub or the default placeholder).
const isRealImg = (u) => !!u && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(u) && !/default-image/i.test(u);
const firstBodyImg = (html) => {
  const m = (html || "").match(/<img[^>]+src=["']([^"']+\.(?:jpe?g|png|webp|gif))["']/i);
  return m ? m[1] : null;
};
// Only pick images whose file was actually downloaded into public/ (some source images 404'd).
const PUBLIC_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");
const fileExists = (u) => {
  const r = rel(u);
  return !!r && existsSync(path.join(PUBLIC_DIR, r.replace(/^\//, "")));
};
const usableImg = (u) => isRealImg(u) && fileExists(u);
// Real categories are short labels; anything long is a mis-scraped bio -> drop.
const cleanCat = (c) => (c && c.trim().length > 0 && c.trim().length <= 40 ? c.trim() : null);

async function main() {
  const issues = JSON.parse(await readFile(path.join(DATA, "issues.json"), "utf8"));
  const articles = JSON.parse(await readFile(path.join(DATA, "articles.json"), "utf8"));
  const pagesData = JSON.parse(await readFile(path.join(DATA, "pages.json"), "utf8"));

  if (existsSync(MEDIA)) {
    await cp(MEDIA, PUBLIC, { recursive: true });
    console.log("Copied media -> public/");
  }

  await prisma.article.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.page.deleteMany();
  await prisma.setting.deleteMany();

  // issue cover = first REAL image in the issue: featured card -> article cover -> first body image.
  const artsByIssue = {};
  for (const a of articles) (artsByIssue[a.issueId] ||= []).push(a);
  const coverByIssue = {};
  for (const iss of issues) {
    let cover = null;
    for (const a of iss.articles || []) if (usableImg(a.cardImage)) { cover = a.cardImage; break; }
    if (!cover) for (const a of artsByIssue[iss.id] || []) if (usableImg(a.coverImage)) { cover = a.coverImage; break; }
    if (!cover) for (const a of artsByIssue[iss.id] || []) { const b = firstBodyImg(a.bodyHtml); if (usableImg(b)) { cover = b; break; } }
    coverByIssue[iss.id] = cover ? rel(cover) : null;
  }

  for (const iss of issues) {
    await prisma.issue.create({
      data: { id: iss.id, volume: iss.volume, issueNo: iss.issueNo, period: iss.period || "", coverImage: coverByIssue[iss.id] || null },
    });
  }

  // order/category fallback from the issue listing
  const metaById = {};
  for (const iss of issues) for (const a of iss.articles) if (!metaById[a.id]) metaById[a.id] = a;

  let n = 0;
  for (const a of articles) {
    const meta = metaById[a.id] || {};
    await prisma.article.create({
      data: {
        id: a.id,
        title: (a.title || "").trim() || "Untitled",
        author: a.author || null,
        category: cleanCat(a.category) || cleanCat(meta.category),
        excerpt: a.description || null,
        bodyHtml: rel(a.bodyHtml) || "",
        coverImage: isRealImg(a.coverImage) ? rel(a.coverImage) : null,
        order: Number.isFinite(meta.order) ? meta.order : 0,
        period: a.period || null,
        issueId: a.issueId,
      },
    });
    n++;
  }

  for (const p of pagesData.pages) await prisma.page.create({ data: p });
  await prisma.setting.create({ data: { key: "contact", value: JSON.stringify(pagesData.contact) } });

  const email = process.env.ADMIN_EMAIL || "admin@bodhanam.net";
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 12) throw new Error("ADMIN_PASSWORD (>=12 chars) is required in .env to seed the admin user.");
  const passwordHash = await bcrypt.hash(pw, 10);
  // Only set the password when first creating the admin; never clobber a rotated password on re-import.
  await prisma.user.upsert({ where: { email }, update: { name: "Admin" }, create: { email, passwordHash, name: "Admin" } });

  console.log(`Imported ${issues.length} issues, ${n} articles, ${pagesData.pages.length} pages, contact settings.`);
  console.log(`Admin user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
