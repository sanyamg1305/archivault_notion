"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_LABEL } from "./status-badge";
import {
  updateLeadStatus,
  updateLeadNotes,
  updateLeadSaleValue,
  updateLeadRepName,
} from "@/lib/leads-actions";
import type { LeadStatus } from "@/generated/prisma/client";

export type LeadDetail = {
  id: string;
  name: string;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  saleValue: string | null;
  isSale: boolean;
  payoutStatus: string;
  repName: string | null;
  updatedAt: Date;
};

export function LeadDetailDialog({
  lead,
  repNames,
  children,
}: {
  lead: LeadDetail;
  repNames?: string[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saleValue, setSaleValue] = useState(lead.saleValue ?? "");
  const [repName, setRepName] = useState(lead.repName ?? "");
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        if (status !== lead.status) {
          await updateLeadStatus(lead.id, status);
        }
        if (notes !== (lead.notes ?? "")) {
          await updateLeadNotes(lead.id, notes);
        }
        if (saleValue !== (lead.saleValue ?? "")) {
          await updateLeadSaleValue(lead.id, saleValue);
        }
        if (repName !== (lead.repName ?? "")) {
          await updateLeadRepName(lead.id, repName);
        }
        toast.success("Lead updated");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to update lead");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)}>{children}</div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lead.name}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p>{lead.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Company</p>
              <p>{lead.company ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Source</p>
              <p>{lead.source ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last updated</p>
              <p>{format(lead.updatedAt, "MMM d, h:mm a")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as LeadStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="repName">Rep</Label>
            <Input
              id="repName"
              list="rep-names"
              value={repName}
              onChange={(e) => setRepName(e.target.value)}
              placeholder="Who's working this lead?"
            />
            {repNames && (
              <datalist id="rep-names">
                {repNames.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="saleValue">Sale value</Label>
            <Input
              id="saleValue"
              inputMode="decimal"
              placeholder="0.00"
              value={saleValue}
              onChange={(e) => setSaleValue(e.target.value)}
            />
            {lead.isSale && (
              <p className="text-xs text-muted-foreground">
                Payout: {lead.payoutStatus}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Notes</Label>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
