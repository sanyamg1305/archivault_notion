import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/generated/prisma/client";

export const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow up",
  converted: "Converted",
  lost: "Lost",
};

const STATUS_VARIANT: Record<LeadStatus, "default" | "secondary" | "outline" | "destructive"> = {
  new: "outline",
  contacted: "secondary",
  follow_up: "secondary",
  converted: "default",
  lost: "destructive",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}
