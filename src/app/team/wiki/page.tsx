import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/empty-state";
import { WikiEditorDialog } from "@/components/wiki/wiki-editor-dialog";

export const dynamic = "force-dynamic";

export default async function WikiIndexPage() {
  const first = await prisma.wikiPage.findFirst({
    orderBy: { order: "asc" },
    select: { slug: true },
  });

  if (first) redirect(`/team/wiki/${first.slug}`);

  return (
    <EmptyState
      icon={<BookOpen className="size-5" />}
      title="No wiki pages yet"
      description="Create the first one to get the team's knowledge base started."
      action={<WikiEditorDialog />}
    />
  );
}
