import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check Issue 57 cover
  const issue57 = await prisma.issue.findUnique({ where: { id: 57 } });
  console.log("Issue 57 coverImage:", issue57?.coverImage);

  // Check Article 700 cover
  const article700 = await prisma.article.findUnique({ where: { id: 700 } });
  console.log("Article 700 coverImage:", article700?.coverImage);

  // Check Article 700 bodyHtml for images
  if (article700?.bodyHtml) {
    const imgMatch = article700.bodyHtml.match(/src="([^"]*\.(webp|jpg|png|gif))"/i);
    if (imgMatch) {
      console.log("First img src in Article 700 bodyHtml:", imgMatch[1]);
    } else {
      console.log("No img src found in Article 700 bodyHtml");
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
