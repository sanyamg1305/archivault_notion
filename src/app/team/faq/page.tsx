import { prisma } from "@/lib/prisma";
import { FaqList } from "@/components/faq/faq-list";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const items = await prisma.faqItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="FAQ"
        description="The cold-call cheat sheet — common objections and how to answer them."
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 md:px-10">
        <FaqList items={items} />
      </div>
    </div>
  );
}
