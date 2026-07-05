import { prisma } from "@/lib/prisma";
import { LeadTable } from "@/components/leads/lead-table";
import { PageHeader } from "@/components/page-header";

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
    <div className="flex flex-1 flex-col">
      <PageHeader title={decoded} description={`${leads.length} lead(s)`} />
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 md:px-10">
        <LeadTable
          leads={leads.map((l) => ({ ...l, saleValue: l.saleValue?.toString() ?? null }))}
        />
      </div>
    </div>
  );
}
