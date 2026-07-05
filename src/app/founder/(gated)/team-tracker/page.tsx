import { Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { AddRepDialog } from "@/components/founder/add-rep-dialog";
import { RepRow, type RepSummary } from "@/components/founder/rep-row";
import { MonthFilter } from "@/components/founder/month-filter";
import { SalesTrendChart } from "@/components/founder/sales-trend-chart";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";

export const dynamic = "force-dynamic";

export default async function TeamTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;

  const [reps, leads] = await Promise.all([
    prisma.repCommission.findMany({ orderBy: { repName: "asc" } }),
    prisma.lead.findMany({ where: { repName: { not: null } } }),
  ]);

  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;
  if (month) {
    const parsed = new Date(`${month}-01T00:00:00`);
    rangeStart = startOfMonth(parsed);
    rangeEnd = endOfMonth(parsed);
  }

  const inRange = (date: Date | null) => {
    if (!rangeStart || !rangeEnd) return true;
    if (!date) return false;
    return date >= rangeStart && date <= rangeEnd;
  };

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
      const sales = repLeads.filter((l) => l.isSale && inRange(l.saleConfirmedAt));
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

  const totalLeads = summaries.reduce((sum, r) => sum + r.totalLeads, 0);
  const totalSales = summaries.reduce((sum, r) => sum + r.totalSales, 0);
  const totalUnpaid = summaries.reduce((sum, r) => sum + r.unpaidAmount, 0);
  const totalPaid = summaries.reduce((sum, r) => sum + r.paidAmount, 0);

  const now = new Date();
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const sales = leads.filter(
      (l) => l.isSale && l.saleConfirmedAt && l.saleConfirmedAt >= start && l.saleConfirmedAt <= end
    ).length;
    return { month: format(d, "MMM"), sales };
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title="Team Tracker"
        description="Sales and commission across the whole team."
        action={<AddRepDialog />}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total leads" value={totalLeads.toString()} />
          <StatCard label="Total sales" value={totalSales.toString()} />
          <StatCard label="Unpaid commission" value={`₹${totalUnpaid.toLocaleString("en-IN")}`} />
          <StatCard label="Paid commission" value={`₹${totalPaid.toLocaleString("en-IN")}`} />
        </div>

        <SalesTrendChart data={chartData} />

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">By rep</h2>
          <MonthFilter />
        </div>

        {summaries.length === 0 ? (
          <EmptyState
            icon={<Users className="size-5" />}
            title="No reps yet"
            description="Add one, or assign a rep name on a lead in the Leads tab."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="hidden border-b bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid md:grid-cols-[1.3fr_0.7fr_0.7fr_1.6fr_1.3fr_auto] md:gap-3">
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
    </div>
  );
}
