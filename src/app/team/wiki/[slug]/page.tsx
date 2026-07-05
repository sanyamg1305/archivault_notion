import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Markdown } from "@/components/markdown";
import { WikiEditorDialog } from "@/components/wiki/wiki-editor-dialog";

export const dynamic = "force-dynamic";

export default async function WikiPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await prisma.wikiPage.findUnique({ where: { slug } });

  if (!page) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {page.title}
        </h1>
        <WikiEditorDialog page={page} />
      </div>
      <div className="rounded-2xl border bg-card p-8 shadow-sm">
        <Markdown content={page.content} />
      </div>
    </div>
  );
}
