import { prisma } from "@/lib/prisma";
import { AllLeadsView } from "@/components/leads/all-leads-view";
import { QuickAddLeadDialog } from "@/components/leads/quick-add-lead-dialog";

export const dynamic = "force-dynamic";

export default async function FounderLeadsPage() {
  const [leads, reps] = await Promise.all([
    prisma.lead.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.repCommission.findMany({
      select: { repName: true },
      orderBy: { repName: "asc" },
    }),
  ]);

  const repNames = reps.map((r) => r.repName);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">All Leads</h1>
          <p className="text-sm text-muted-foreground">
            Every lead in one place — spot what&apos;s stalled.
          </p>
        </div>
        <QuickAddLeadDialog repNames={repNames} />
      </div>

      <AllLeadsView
        leads={leads.map((l) => ({
          ...l,
          saleValue: l.saleValue?.toString() ?? null,
        }))}
        repNames={repNames}
      />
    </div>
  );
}
