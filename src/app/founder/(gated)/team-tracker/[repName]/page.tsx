import { prisma } from "@/lib/prisma";
import { LeadTable } from "@/components/leads/lead-table";

export const dynamic = "force-dynamic";

export default async function RepDetailPage({
  params,
}: {
  params: Promise<{ repName: string }>;
}) {
  const { repName } = await params;
  const decoded = decodeURIComponent(repName);

  const leads = await prisma.lead.findMany({
    where: { repName: decoded },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{decoded}</h1>
        <p className="text-sm text-muted-foreground">{leads.length} lead(s)</p>
      </div>
      <LeadTable
        leads={leads.map((l) => ({ ...l, saleValue: l.saleValue?.toString() ?? null }))}
      />
    </div>
  );
}
