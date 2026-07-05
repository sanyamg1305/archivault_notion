// One-off helper: prints INSERT statements for the starter Wiki/FAQ content,
// for pasting directly into the Supabase SQL Editor when you don't have a
// direct DB connection string handy. Run with: npx tsx prisma/print-seed-sql.ts
import { randomUUID } from "node:crypto";
import { wikiPages, faqItems } from "./seed-data";

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

const lines: string[] = [];

for (const page of wikiPages) {
  lines.push(
    `INSERT INTO "wiki_pages" ("id", "slug", "title", "content", "order", "updatedAt") VALUES (${sqlString(
      randomUUID()
    )}, ${sqlString(page.slug)}, ${sqlString(page.title)}, ${sqlString(
      page.content
    )}, ${page.order}, now()) ON CONFLICT ("slug") DO UPDATE SET "title" = EXCLUDED."title", "content" = EXCLUDED."content", "order" = EXCLUDED."order", "updatedAt" = now();`
  );
}

for (const item of faqItems) {
  lines.push(
    `INSERT INTO "faq_items" ("id", "question", "answer", "category", "order") VALUES (${sqlString(
      randomUUID()
    )}, ${sqlString(item.question)}, ${sqlString(item.answer)}, ${sqlString(
      item.category
    )}, ${item.order});`
  );
}

console.log(lines.join("\n\n"));
