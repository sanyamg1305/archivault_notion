import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { wikiPages, faqItems } from "./seed-data";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  for (const page of wikiPages) {
    await prisma.wikiPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  for (const item of faqItems) {
    const existing = await prisma.faqItem.findFirst({
      where: { question: item.question },
    });
    if (existing) {
      await prisma.faqItem.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.faqItem.create({ data: item });
    }
  }

  console.log(`Seeded ${wikiPages.length} wiki pages and ${faqItems.length} FAQ items.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
