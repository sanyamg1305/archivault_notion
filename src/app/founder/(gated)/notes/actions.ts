"use server";

import { prisma } from "@/lib/prisma";
import { isFounderUnlocked } from "@/lib/founder-passphrase";

const SINGLETON_ID = "founder-notes";

export async function saveFounderNote(content: string) {
  // Re-checked on every save, not just page load — a stale tab that
  // never re-fetches the layout still can't write once the cookie expires.
  if (!(await isFounderUnlocked())) {
    throw new Error("Not authorized.");
  }

  const note = await prisma.founderNote.upsert({
    where: { id: SINGLETON_ID },
    update: { content },
    create: { id: SINGLETON_ID, content },
  });

  return { updatedAt: note.updatedAt };
}
