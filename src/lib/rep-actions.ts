"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RepSchema = z.object({
  repName: z.string().min(1, "Name is required.").max(200),
  commissionType: z.enum(["flat", "percent"]),
  commissionRate: z.coerce.number().min(0).max(999999),
});

export async function upsertRepCommission(formData: FormData) {
  const parsed = RepSchema.parse({
    repName: formData.get("repName"),
    commissionType: formData.get("commissionType") ?? "flat",
    commissionRate: formData.get("commissionRate") ?? 0,
  });

  await prisma.repCommission.upsert({
    where: { repName: parsed.repName },
    update: {
      commissionType: parsed.commissionType,
      commissionRate: parsed.commissionRate,
    },
    create: parsed,
  });

  revalidatePath("/founder/team-tracker");
  revalidatePath("/founder/leads");
}

// Removes the rep from the commission-config list only. Their historical
// leads/sales stay exactly as they are (repName is just a text label on
// Lead, not a foreign key) — this just stops them showing up as an
// explicitly configured rep.
export async function removeRep(repName: string) {
  await prisma.repCommission.delete({ where: { repName } });
  revalidatePath("/founder/team-tracker");
  revalidatePath("/founder/leads");
}
