import { prisma } from "@/lib/prisma";
import { AddRepDialog } from "@/components/founder/add-rep-dialog";
import { RepRow, type RepSummary } from "@/components/founder/rep-row";

export const dynamic = "force-dynamic";

export default async function TeamTrackerPage() {
  const [reps, leads] = await Promise.all([
    prisma.repCommission.findMany({ orderBy: { repName: "asc" } }),
    prisma.lead.findMany({ where: { repName: { not: null } } }),
  ]);

  const repByName = new Map(reps.map((r) => [r.repName, r]));
  const leadsByRep = new Map<string, typeof leads>();
  for (const lead of leads) {
    const key = lead.repName!;
    if (!leadsByRep.has(key)) leadsByRep.set(key, []);
    leadsByRep.get(key)!.push(lead);
  }

  const allNames = new Set([...repByName.keys(), ...leadsByRep.keys()]);

  const summaries: RepSummary[] = Array.from(allNames)
    .sort()
    .map((repName) => {
      const config = repByName.get(repName);
      const repLeads = leadsByRep.get(repName) ?? [];
      const sales = repLeads.filter((l) => l.isSale);
      const unpaid = sales.filter((l) => l.payoutStatus === "unpaid");
      const paid = sales.filter((l) => l.payoutStatus === "paid");

      const commissionType = config?.commissionType ?? "flat";
      const commissionRate = config?.commissionRate ?? 0;

      const amountFor = (subset: typeof sales) =>
        commissionType === "flat"
          ? subset.length * Number(commissionRate)
          : subset.reduce(
              (sum, l) => sum + (Number(l.saleValue ?? 0) * Number(commissionRate)) / 100,
              0
            );

      return {
        repName,
        commissionType,
        commissionRate: commissionRate.toString(),
        totalLeads: repLeads.length,
        totalSales: sales.length,
        unpaidAmount: Math.round(amountFor(unpaid)),
        paidAmount: Math.round(amountFor(paid)),
        unpaidLeadIds: unpaid.map((l) => l.id),
        configured: Boolean(config),
      };
    });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Team Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Sales and commission across the whole team.
          </p>
        </div>
        <AddRepDialog />
      </div>

      {summaries.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No reps yet. Add one, or assign a rep name on a lead in the Leads tab.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="hidden border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase text-muted-foreground md:grid md:grid-cols-[1.3fr_0.7fr_0.7fr_1.6fr_1.3fr_auto] md:gap-3">
            <span>Rep</span>
            <span>Leads</span>
            <span>Sales</span>
            <span>Commission rate</span>
            <span>Owed / Paid</span>
            <span />
          </div>
          {summaries.map((rep) => (
            <RepRow key={rep.repName} rep={rep} />
          ))}
        </div>
      )}
    </div>
  );
}
