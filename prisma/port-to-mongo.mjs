#!/usr/bin/env node

/**
 * Migrate SQLite data to MongoDB, applying curated updates and new issue data.
 * Optimized: batch processing, skip external downloads (images handled separately).
 */

import { PrismaClient } from "@prisma/client";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Load env vars
const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

// Initialize Prisma for MongoDB
const prisma = new PrismaClient();

// Main migration
async function migrate() {
  console.log("🔄 Starting MongoDB migration...\n");

  try {
    // Step 1: Wipe existing Mongo collections (except User)
    console.log("Step 1: Clearing existing MongoDB collections...");
    await prisma.article.deleteMany({});
    await prisma.issue.deleteMany({});
    await prisma.column.deleteMany({});
    await prisma.page.deleteMany({});
    await prisma.setting.deleteMany({});
    console.log("  ✓ Cleared: Article, Issue, Column, Page, Setting\n");

    // Step 2: Read SQLite data
    console.log("Step 2: Reading SQLite data...");
    const dbPath = join(__dirname, "dev.db");
    const sqlite = new DatabaseSync(dbPath);

    const issues = sqlite.prepare("SELECT * FROM Issue").all();
    const articles = sqlite.prepare("SELECT * FROM Article").all();
    const pages = sqlite.prepare("SELECT * FROM Page").all();
    const settings = sqlite.prepare("SELECT * FROM Setting").all();

    console.log(`  ✓ Read: ${issues.length} issues, ${articles.length} articles, ${pages.length} pages, ${settings.length} settings\n`);

    // Step 3: Load curated data
    console.log("Step 3: Loading curated data...");
    const issue57FlagsPath = join(__dirname, "..", "..", "scraper", "issue57-flags.json");
    const issue58ArticlesPath = join(__dirname, "..", "..", "scraper", "issue58-articles.json");

    let issue57Flags = {};
    let issue58Articles = [];

    try {
      issue57Flags = JSON.parse(readFileSync(issue57FlagsPath, "utf-8"));
      issue57Flags = Object.fromEntries(issue57Flags.map(f => [f.id, f]));
      console.log(`  ✓ Loaded issue57 flags: ${Object.keys(issue57Flags).length} articles`);
    } catch (error) {
      console.warn(`  ⚠ Issue 57 flags not found: ${error.message}`);
    }

    try {
      issue58Articles = JSON.parse(readFileSync(issue58ArticlesPath, "utf-8"));
      console.log(`  ✓ Loaded issue58 articles: ${issue58Articles.length} articles\n`);
    } catch (error) {
      console.warn(`  ⚠ Issue 58 articles not found: ${error.message}\n`);
    }

    // Step 4: Migrate Issues
    console.log("Step 4: Migrating issues...");
    for (const issue of issues) {
      await prisma.issue.create({
        data: {
          id: issue.id,
          volume: issue.volume,
          issueNo: issue.issueNo,
          period: issue.period,
          coverImage: issue.coverImage || null,
          published: true, // Legacy default
        },
      });
    }
    console.log(`  ✓ Migrated ${issues.length} issues\n`);

    // Step 5: Migrate Articles with curated covernum/slug updates
    console.log("Step 5: Migrating articles (batch)...");
    const BATCH_SIZE = 100;
    for (let i = 0; i < articles.length; i += BATCH_SIZE) {
      const batch = articles.slice(i, i + BATCH_SIZE);
      for (const article of batch) {
        const curated = issue57Flags[article.id];
        const covernum = curated ? (parseInt(curated.covernum) || 0) : 0;
        const slug = curated ? (curated.slug || null) : null;

        try {
          await prisma.article.create({
            data: {
              id: article.id,
              title: article.title,
              author: article.author || null,
              category: article.category || null,
              excerpt: article.excerpt || null,
              bodyHtml: article.bodyHtml || "",
              coverImage: article.coverImage || null,
              order: article.order || 0,
              covernum,
              slug,
              period: article.period || null,
              issueId: article.issueId,
            },
          });
        } catch (error) {
          console.error(`  ✗ Failed to create article ${article.id}:`, error.message);
        }
      }
      console.log(`  ✓ Migrated articles ${i + 1}-${Math.min(i + BATCH_SIZE, articles.length)}`);
    }
    console.log(`  ✓ Total articles migrated: ${articles.length}\n`);

    // Step 6: Migrate Pages
    console.log("Step 6: Migrating pages...");
    for (const page of pages) {
      await prisma.page.create({
        data: {
          slug: page.slug,
          title: page.title,
          bodyHtml: page.bodyHtml || "",
        },
      });
    }
    console.log(`  ✓ Migrated ${pages.length} pages\n`);

    // Step 7: Migrate Settings
    console.log("Step 7: Migrating settings...");
    for (const setting of settings) {
      await prisma.setting.create({
        data: {
          key: setting.key,
          value: setting.value,
        },
      });
    }
    console.log(`  ✓ Migrated ${settings.length} settings\n`);

    // Step 8: Seed Columns
    console.log("Step 8: Seeding columns...");
    const columnNames = [
      "മുഖക്കുറിപ്പ്‌",
      "ഖുര്‍ആന്‍",
      "ചോദ്യോത്തരം",
      "ബുക് ഷെല്‍ഫ്‌",
      "അനുസ്മരണം",
    ];

    for (let i = 0; i < columnNames.length; i++) {
      await prisma.column.create({
        data: {
          id: i + 1,
          name: columnNames[i],
          order: i + 1,
        },
      });
    }
    console.log(`  ✓ Seeded ${columnNames.length} columns\n`);

    // Step 9: Create Issue 58 (new)
    console.log("Step 9: Creating Issue 58...");
    await prisma.issue.create({
      data: {
        id: 58,
        volume: 23,
        issueNo: 2,
        period: "2025 ഒക്ടോബർ - ഡിസംബർ",
        published: false,
        coverImage: null,
      },
    });
    console.log("  ✓ Created Issue 58 (unpublished)\n");

    // Step 10: Add Issue 58 articles (image processing skipped, handled separately)
    console.log("Step 10: Adding Issue 58 articles...");
    if (issue58Articles && issue58Articles.length > 0) {
      for (const article of issue58Articles) {
        // Keep coverImage as-is (will be processed separately by image handler script)
        let bodyHtml = article.bodyHtml || "";

        await prisma.article.create({
          data: {
            id: article.id,
            title: article.title,
            author: article.author || null,
            category: article.category || null,
            excerpt: article.description || null,
            bodyHtml,
            coverImage: article.coverImage ? (article.coverImage.trim() || null) : null,
            order: article.order || 0,
            covernum: article.covernum || 0,
            slug: article.slug || null,
            period: article.period || null,
            issueId: article.issueId,
          },
        });
        console.log(`  ✓ Created article ${article.id}`);
      }
    }
    console.log(`  ✓ Processed ${issue58Articles.length} Issue 58 articles\n`);

    // Step 11: Verify User exists (create default if not)
    console.log("Step 11: Checking User collection...");
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@bodhanam.net" },
    });

    if (!existingUser) {
      console.log("  Creating default admin user...");
      await prisma.user.create({
        data: {
          id: 1,
          email: "admin@bodhanam.net",
          passwordHash: "placeholder",
          name: "Admin",
          role: "admin",
        },
      });
      console.log("  ✓ Created default admin user");
    } else {
      console.log("  ✓ Admin user already exists");
    }

    // Step 12: Verification
    console.log("\n📊 Verification:\n");
    const issueCounts = await prisma.issue.count();
    const articleCounts = await prisma.article.count();
    const columnCounts = await prisma.column.count();
    const pageCounts = await prisma.page.count();
    const settingCounts = await prisma.setting.count();
    const userCounts = await prisma.user.count();

    console.log(`  Issues: ${issueCounts}`);
    console.log(`  Articles: ${articleCounts}`);
    console.log(`  Columns: ${columnCounts}`);
    console.log(`  Pages: ${pageCounts}`);
    console.log(`  Settings: ${settingCounts}`);
    console.log(`  Users: ${userCounts}`);

    // Verify specific curated data
    const article700 = await prisma.article.findUnique({ where: { id: 700 } });
    if (article700) {
      console.log(
        `\n  Article 700: covernum=${article700.covernum}, slug="${article700.slug || "null"}"`
      );
    }

    const article711 = await prisma.article.findUnique({ where: { id: 711 } });
    if (article711) {
      console.log(`  Article 711: coverImage="${article711.coverImage || "null"}"`);
    }

    const issue58 = await prisma.issue.findUnique({ where: { id: 58 } });
    if (issue58) {
      console.log(`  Issue 58: published=${issue58.published}, period="${issue58.period}"`);
    }

    const legacyArticle = await prisma.article.findFirst({
      where: { id: { lt: 694 }, coverImage: { not: null } },
      orderBy: { id: "desc" },
    });
    if (legacyArticle) {
      const isCDN = legacyArticle.coverImage.includes("://");
      console.log(`  Legacy article ${legacyArticle.id}: coverImage is ${isCDN ? "CDN URL" : "path"}`);
    }

    console.log("\n✅ Migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrate().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
