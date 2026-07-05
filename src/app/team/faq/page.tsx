import { prisma } from "@/lib/prisma";
import { FaqList } from "@/components/faq/faq-list";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const items = await prisma.faqItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">FAQ</h1>
        <p className="text-sm text-muted-foreground">
          The cold-call cheat sheet — common objections and how to answer them.
        </p>
      </div>
      <FaqList items={items} />
    </div>
  );
}
