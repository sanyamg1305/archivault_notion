import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { WikiMobileNav } from "@/components/wiki/wiki-mobile-nav";
import { WikiEditorDialog } from "@/components/wiki/wiki-editor-dialog";

export const dynamic = "force-dynamic";

export default async function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await prisma.wikiPage.findMany({
    orderBy: { order: "asc" },
    select: { id: true, slug: true, title: true },
  });

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <aside className="hidden w-56 shrink-0 flex-col gap-1 border-r p-4 md:flex">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase text-muted-foreground">
            Pages
          </h2>
        </div>
        {pages.map((p) => (
          <Link
            key={p.id}
            href={`/team/wiki/${p.slug}`}
            className="truncate rounded-md px-2 py-1.5 text-sm hover:bg-muted"
          >
            {p.title}
          </Link>
        ))}
        <div className="mt-3">
          <WikiEditorDialog />
        </div>
      </aside>

      <div className="flex-1 p-6">
        <div className="mb-4 md:hidden">
          <WikiMobileNav pages={pages} />
          <div className="mt-3">
            <WikiEditorDialog />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
