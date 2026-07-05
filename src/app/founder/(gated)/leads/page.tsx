import { prisma } from "@/lib/prisma";
import { AllLeadsView } from "@/components/leads/all-leads-view";
import { QuickAddLeadDialog } from "@/components/leads/quick-add-lead-dialog";
import { PageHeader } from "@/components/page-header";

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
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="All Leads"
        description="Every lead in one place — spot what's stalled."
        action={<QuickAddLeadDialog repNames={repNames} />}
      />
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 md:px-10">
        <AllLeadsView
          leads={leads.map((l) => ({
            ...l,
            saleValue: l.saleValue?.toString() ?? null,
          }))}
          repNames={repNames}
        />
      </div>
    </div>
  );
}
