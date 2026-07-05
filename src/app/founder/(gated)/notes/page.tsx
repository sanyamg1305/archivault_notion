import { prisma } from "@/lib/prisma";
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
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Private Notes</h1>
        <p className="text-sm text-muted-foreground">
          Visible only in Founder Mode — never shown to the team.
        </p>
      </div>
      <NotesEditor initialContent={note.content} initialUpdatedAt={note.updatedAt} />
    </div>
  );
}
