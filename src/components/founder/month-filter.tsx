"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format, subMonths } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function monthOptions() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, i);
    return { value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") };
  });
}

export function MonthFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("month") ?? "all";
  const options = monthOptions();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("month");
    } else {
      params.set("month", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={current} onValueChange={(v) => v && handleChange(v)}>
      <SelectTrigger className="w-44 bg-card">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All time</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
