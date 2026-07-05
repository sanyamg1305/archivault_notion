"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadTable } from "./lead-table";
import type { LeadDetail } from "./lead-detail-dialog";

export function AllLeadsView({
  leads,
  repNames,
}: {
  leads: LeadDetail[];
  repNames: string[];
}) {
  const [repFilter, setRepFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (repFilter === "all" ? leads : leads.filter((l) => l.repName === repFilter)),
    [leads, repFilter]
  );

  return (
    <div className="flex flex-col gap-3">
      <Select value={repFilter} onValueChange={(v) => v && setRepFilter(v)}>
        <SelectTrigger className="w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All reps</SelectItem>
          {repNames.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <LeadTable leads={filtered} repNames={repNames} showRepColumn />
    </div>
  );
}
