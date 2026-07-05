import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WikiEditorDialog } from "@/components/wiki/wiki-editor-dialog";

export const dynamic = "force-dynamic";

export default async function WikiIndexPage() {
  const first = await prisma.wikiPage.findFirst({
    orderBy: { order: "asc" },
    select: { slug: true },
  });

  if (first) redirect(`/team/wiki/${first.slug}`);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <p className="text-sm text-muted-foreground">
        No wiki pages yet. Create the first one to get the team&apos;s
        knowledge base started.
      </p>
      <WikiEditorDialog />
    </div>
  );
}
