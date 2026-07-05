"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const WikiSchema = z.object({
  title: z.string().min(1, "Title is required.").max(200),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  content: z.string().max(50000),
});

export async function createWikiPage(formData: FormData) {
  const parsed = WikiSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content") ?? "",
  });

  const count = await prisma.wikiPage.count();
  await prisma.wikiPage.create({ data: { ...parsed, order: count } });

  revalidatePath("/team/wiki");
  redirect(`/team/wiki/${parsed.slug}`);
}

export async function updateWikiPage(id: string, formData: FormData) {
  const parsed = WikiSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    content: formData.get("content") ?? "",
  });

  await prisma.wikiPage.update({ where: { id }, data: parsed });

  revalidatePath("/team/wiki");
  revalidatePath(`/team/wiki/${parsed.slug}`);
  redirect(`/team/wiki/${parsed.slug}`);
}

export async function deleteWikiPage(id: string, slug: string) {
  await prisma.wikiPage.delete({ where: { id } });
  revalidatePath("/team/wiki");
  revalidatePath(`/team/wiki/${slug}`);
  redirect("/team/wiki");
}
