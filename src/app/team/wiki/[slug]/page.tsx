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
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{page.title}</h1>
        <WikiEditorDialog page={page} />
      </div>
      <Markdown content={page.content} />
    </div>
  );
}
