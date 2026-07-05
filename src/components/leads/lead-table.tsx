"use client";

import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const filtered = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [leads, filter]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Select value={filter} onValueChange={(v) => v && setFilter(v as LeadStatus | "all")}>
          <SelectTrigger className="w-44">
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
        <span className="text-xs text-muted-foreground">
          {filtered.length} lead{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No leads here yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          {/* Desktop header */}
          <div
            className={`hidden border-b bg-muted/40 px-4 py-2 text-xs font-medium uppercase text-muted-foreground md:grid md:gap-3 ${
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
                    className={`grid cursor-pointer grid-cols-1 gap-1.5 px-4 py-3 text-sm transition-colors hover:bg-muted/40 md:items-center md:gap-3 ${
                      showRepColumn
                        ? "md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto]"
                        : "md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
                    }`}
                  >
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {lead.phone ?? "—"}
                      </p>
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
