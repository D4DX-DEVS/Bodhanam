import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CDN_ENDPOINT = process.env.DO_SPACES_CDN_ENDPOINT || "https://bodhanam.nyc3.cdn.digitaloceanspaces.com";
const SPACES_FOLDER = process.env.DO_SPACES_FOLDER || "bodhanam";

async function main() {
  console.log("Checking CDN references in database...\n");

  // Check Issue 57 cover
  const issue57 = await prisma.issue.findUnique({ where: { id: 57 } });
  console.log("Issue 57 coverImage:", issue57?.coverImage);
  if (issue57?.coverImage?.includes(CDN_ENDPOINT) || issue57?.coverImage?.includes(SPACES_FOLDER)) {
    console.log("  ✓ Already using CDN");
  }

  // Check Article 700 cover
  const article700 = await prisma.article.findUnique({ where: { id: 700 } });
  console.log("\nArticle 700 coverImage:", article700?.coverImage);
  if (article700?.coverImage?.includes(CDN_ENDPOINT) || article700?.coverImage?.includes(SPACES_FOLDER)) {
    console.log("  ✓ Already using CDN");
  }

  // Check Article 700 bodyHtml for images
  console.log("\nArticle 700 bodyHtml image refs:");
  if (article700?.bodyHtml) {
    const imgMatches = article700.bodyHtml.match(/src="([^"]*\.(webp|jpg|png|gif))"/gi);
    if (imgMatches) {
      imgMatches.slice(0, 3).forEach((match, i) => {
        const url = match.match(/src="([^"]+)"/)[1];
        console.log(`  [${i + 1}] ${url}`);
        if (url.includes(CDN_ENDPOINT) || url.includes(SPACES_FOLDER)) {
          console.log("      ✓ Using CDN");
        } else {
          console.log("      ✗ Still local");
        }
      });
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
