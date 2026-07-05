import { prisma } from "@/lib/prisma";
import { WikiMobileNav } from "@/components/wiki/wiki-mobile-nav";
import { WikiSidebarNav } from "@/components/wiki/wiki-sidebar-nav";
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
      <aside className="hidden w-64 shrink-0 flex-col gap-1 border-r bg-card/40 p-5 md:flex">
        <h2 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Pages
        </h2>
        <WikiSidebarNav pages={pages} />
        <div className="mt-4 border-t pt-4">
          <WikiEditorDialog />
        </div>
      </aside>

      <div className="flex-1 px-6 py-8 md:px-10">
        <div className="mb-6 flex flex-col gap-3 md:hidden">
          <WikiMobileNav pages={pages} />
          <WikiEditorDialog />
        </div>
        {children}
      </div>
    </div>
  );
}
