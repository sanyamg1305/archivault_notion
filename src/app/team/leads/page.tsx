import { prisma } from "@/lib/prisma";
import { LeadTable } from "@/components/leads/lead-table";
import { QuickAddLeadDialog } from "@/components/leads/quick-add-lead-dialog";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function TeamLeadsPage() {
  const [leads, reps] = await Promise.all([
    prisma.lead.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.repCommission.findMany({ select: { repName: true }, orderBy: { repName: "asc" } }),
  ]);

  const repNames = reps.map((r) => r.repName);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Leads"
        description="Shared across the whole team — tap a lead to update its status or notes."
        action={<QuickAddLeadDialog repNames={repNames} />}
      />
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 md:px-10">
        <LeadTable
          leads={leads.map((l) => ({
            ...l,
            saleValue: l.saleValue?.toString() ?? null,
          }))}
          repNames={repNames}
          showRepColumn
        />
      </div>
    </div>
  );
}
