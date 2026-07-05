"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { upsertRepCommission, removeRep } from "@/lib/rep-actions";
import { setLeadsPayoutStatus } from "@/lib/leads-actions";

export type RepSummary = {
  repName: string;
  commissionType: "flat" | "percent";
  commissionRate: string;
  totalLeads: number;
  totalSales: number;
  unpaidAmount: number;
  paidAmount: number;
  unpaidLeadIds: string[];
  configured: boolean;
};

export function RepRow({ rep }: { rep: RepSummary }) {
  const [commissionType, setCommissionType] = useState(rep.commissionType);
  const [commissionRate, setCommissionRate] = useState(rep.commissionRate);
  const [pending, startTransition] = useTransition();

  function saveCommission() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("repName", rep.repName);
      formData.set("commissionType", commissionType);
      formData.set("commissionRate", commissionRate);
      await upsertRepCommission(formData);
      toast.success("Commission settings saved");
    });
  }

  function markPaid() {
    startTransition(async () => {
      await setLeadsPayoutStatus(rep.unpaidLeadIds, "paid");
      toast.success(`Marked ${rep.unpaidLeadIds.length} sale(s) as paid`);
    });
  }

  function remove() {
    startTransition(async () => {
      await removeRep(rep.repName);
      toast.success("Removed from rep list");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3 border-b p-4 last:border-b-0 md:grid-cols-[1.3fr_0.7fr_0.7fr_1.6fr_1.3fr_auto] md:items-center">
      <div>
        <Link
          href={`/founder/team-tracker/${encodeURIComponent(rep.repName)}`}
          className="font-medium hover:underline"
        >
          {rep.repName}
        </Link>
        {!rep.configured && (
          <p className="text-xs text-muted-foreground">Not yet configured</p>
        )}
      </div>

      <div className="text-sm">
        <span className="text-muted-foreground md:hidden">Leads: </span>
        {rep.totalLeads}
      </div>

      <div className="text-sm">
        <span className="text-muted-foreground md:hidden">Sales: </span>
        {rep.totalSales}
      </div>

      <div className="flex items-center gap-1.5">
        <Select
          value={commissionType}
          onValueChange={(v) => v && setCommissionType(v as "flat" | "percent")}
        >
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat ₹</SelectItem>
            <SelectItem value="percent">% of sale</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="h-8 w-20 text-xs"
          value={commissionRate}
          onChange={(e) => setCommissionRate(e.target.value)}
          inputMode="decimal"
        />
        <Button size="sm" variant="outline" className="h-8" disabled={pending} onClick={saveCommission}>
          Save
        </Button>
      </div>

      <div className="text-xs">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline">Unpaid: ₹{rep.unpaidAmount.toLocaleString("en-IN")}</Badge>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
          Paid: ₹{rep.paidAmount.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          disabled={pending || rep.unpaidLeadIds.length === 0}
          onClick={markPaid}
        >
          Mark paid
        </Button>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" />
            }
          >
            Remove
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {rep.repName} from the rep list?</AlertDialogTitle>
              <AlertDialogDescription>
                This only removes their commission configuration. Their leads and
                sales history stay exactly as they are.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={remove}>Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
