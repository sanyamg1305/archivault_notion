import { prisma } from "@/lib/prisma";
import { LeadTable } from "@/components/leads/lead-table";
import { QuickAddLeadDialog } from "@/components/leads/quick-add-lead-dialog";

export const dynamic = "force-dynamic";

export default async function TeamLeadsPage() {
  const [leads, reps] = await Promise.all([
    prisma.lead.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.repCommission.findMany({ select: { repName: true }, orderBy: { repName: "asc" } }),
  ]);

  const repNames = reps.map((r) => r.repName);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Shared across the whole team. Tap a lead to update its status or notes.
          </p>
        </div>
        <QuickAddLeadDialog repNames={repNames} />
      </div>

      <LeadTable
        leads={leads.map((l) => ({
          ...l,
          saleValue: l.saleValue?.toString() ?? null,
        }))}
        repNames={repNames}
        showRepColumn
      />
    </div>
  );
}
