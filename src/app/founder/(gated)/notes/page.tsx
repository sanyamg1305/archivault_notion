import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { NotesEditor } from "./notes-editor";

export const dynamic = "force-dynamic";

const SINGLETON_ID = "founder-notes";

export default async function FounderNotesPage() {
  const note = await prisma.founderNote.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID, content: "" },
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Private Notes"
        description="Visible only in Founder Mode — never shown to the team."
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 md:px-10">
        <NotesEditor initialContent={note.content} initialUpdatedAt={note.updatedAt} />
      </div>
    </div>
  );
}
