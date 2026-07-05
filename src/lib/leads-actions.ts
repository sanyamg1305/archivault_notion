"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { LeadStatus, PayoutStatus } from "@/generated/prisma/client";

const LeadSchema = z.object({
  name: z.string().min(1, "Name is required.").max(200),
});

function clean(value: FormDataEntryValue | null) {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : null;
}

export async function createLead(formData: FormData) {
  LeadSchema.parse({ name: formData.get("name") });

  await prisma.lead.create({
    data: {
      name: String(formData.get("name")),
      phone: clean(formData.get("phone")),
      company: clean(formData.get("company")),
      source: clean(formData.get("source")),
      notes: clean(formData.get("notes")),
      repName: clean(formData.get("repName")),
    },
  });

  revalidatePath("/team/leads");
  revalidatePath("/founder/leads");
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const becomingSale = status === "converted";

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status,
      isSale: becomingSale,
      saleConfirmedAt: becomingSale ? new Date() : null,
      // Reverting a mistaken "converted" back to another status also
      // resets payout so it doesn't linger as paid/unpaid for a non-sale.
      payoutStatus: becomingSale ? undefined : "unpaid",
    },
  });

  revalidatePath("/team/leads");
  revalidatePath("/founder/leads");
  revalidatePath("/founder/team-tracker");
}

export async function updateLeadNotes(leadId: string, notes: string) {
  await prisma.lead.update({
    where: { id: leadId },
    data: { notes: notes.trim() || null },
  });
  revalidatePath("/team/leads");
  revalidatePath("/founder/leads");
}

export async function updateLeadSaleValue(leadId: string, saleValue: string) {
  const value = saleValue.trim();
  await prisma.lead.update({
    where: { id: leadId },
    data: { saleValue: value ? value : null },
  });
  revalidatePath("/team/leads");
  revalidatePath("/founder/leads");
  revalidatePath("/founder/team-tracker");
}

export async function updateLeadRepName(leadId: string, repName: string) {
  await prisma.lead.update({
    where: { id: leadId },
    data: { repName: repName.trim() || null },
  });
  revalidatePath("/team/leads");
  revalidatePath("/founder/leads");
  revalidatePath("/founder/team-tracker");
}

// Founder-only in practice (only reachable from /founder/*), bulk marks a
// rep's sales as paid/unpaid.
export async function setLeadsPayoutStatus(
  leadIds: string[],
  payoutStatus: PayoutStatus
) {
  await prisma.lead.updateMany({
    where: { id: { in: leadIds }, isSale: true },
    data: { payoutStatus },
  });

  revalidatePath("/founder/team-tracker");
  revalidatePath("/founder/leads");
}
