"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Contact, Search, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { downloadCsv } from "@/lib/csv";
import { StatusBadge, STATUS_LABEL } from "./status-badge";
import { LeadDetailDialog, type LeadDetail } from "./lead-detail-dialog";
import type { LeadStatus } from "@/generated/prisma/client";

export function LeadTable({
  leads,
  repNames,
  showRepColumn = false,
}: {
  leads: LeadDetail[];
  repNames?: string[];
  showRepColumn?: boolean;
}) {
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const byStatus = filter === "all" ? leads : leads.filter((l) => l.status === filter);
    const q = query.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter((l) =>
      [l.name, l.phone, l.company, l.repName]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [leads, filter, query]);

  function exportCsv() {
    downloadCsv(
      `leads-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Name", "Phone", "Company", "Source", "Rep", "Status", "Sale value", "Payout", "Notes", "Updated"],
      filtered.map((l) => [
        l.name,
        l.phone,
        l.company,
        l.source,
        l.repName,
        STATUS_LABEL[l.status],
        l.saleValue,
        l.isSale ? l.payoutStatus : "",
        l.notes,
        l.updatedAt.toISOString(),
      ])
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search leads…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-card pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v as LeadStatus | "all")}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} lead{filtered.length === 1 ? "" : "s"}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto gap-1.5 bg-card"
          onClick={exportCsv}
          disabled={filtered.length === 0}
        >
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Contact className="size-5" />}
          title={leads.length === 0 ? "No leads here yet" : "No leads match your search"}
          description={
            leads.length === 0
              ? "Add your first lead to get the tracker started."
              : "Try a different name, phone, company, or rep."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {/* Desktop header */}
          <div
            className={`hidden border-b bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid md:gap-3 ${
              showRepColumn
                ? "md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]"
                : "md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
            }`}
          >
            <span>Name</span>
            <span>Company</span>
            <span>Source</span>
            {showRepColumn && <span>Rep</span>}
            <span>Status</span>
            <span className="text-right">Updated</span>
          </div>

          <ul className="divide-y">
            {filtered.map((lead) => (
              <li key={lead.id}>
                <LeadDetailDialog lead={lead} repNames={repNames}>
                  <div
                    className={`grid cursor-pointer grid-cols-1 gap-1.5 px-5 py-4 text-sm transition-colors hover:bg-accent/40 md:items-center md:gap-3 ${
                      showRepColumn
                        ? "md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]"
                        : "md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary hover:underline md:hidden"
                        >
                          {lead.phone}
                        </a>
                      )}
                    </div>
                    <p className="hidden text-muted-foreground md:block">
                      {lead.company ?? "—"}
                    </p>
                    <p className="hidden text-muted-foreground md:block">
                      {lead.source ?? "—"}
                    </p>
                    {showRepColumn && (
                      <p className="text-muted-foreground">{lead.repName ?? "—"}</p>
                    )}
                    <div>
                      <StatusBadge status={lead.status} />
                    </div>
                    <p className="text-xs text-muted-foreground md:text-right">
                      {formatDistanceToNow(lead.updatedAt, { addSuffix: true })}
                    </p>
                  </div>
                </LeadDetailDialog>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
