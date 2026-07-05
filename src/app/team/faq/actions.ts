"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const FaqSchema = z.object({
  question: z.string().min(1, "Question is required.").max(300),
  answer: z.string().min(1, "Answer is required.").max(10000),
  category: z.string().max(100).optional().or(z.literal("")),
});

export async function createFaqItem(formData: FormData) {
  const parsed = FaqSchema.parse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category"),
  });

  const count = await prisma.faqItem.count();
  await prisma.faqItem.create({
    data: {
      question: parsed.question,
      answer: parsed.answer,
      category: parsed.category || null,
      order: count,
    },
  });

  revalidatePath("/team/faq");
}

export async function updateFaqItem(id: string, formData: FormData) {
  const parsed = FaqSchema.parse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category"),
  });

  await prisma.faqItem.update({
    where: { id },
    data: {
      question: parsed.question,
      answer: parsed.answer,
      category: parsed.category || null,
    },
  });

  revalidatePath("/team/faq");
}

export async function deleteFaqItem(id: string) {
  await prisma.faqItem.delete({ where: { id } });
  revalidatePath("/team/faq");
}
