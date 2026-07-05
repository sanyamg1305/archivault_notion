"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { upsertRepCommission } from "@/lib/rep-actions";

export function AddRepDialog() {
  const [open, setOpen] = useState(false);
  const [commissionType, setCommissionType] = useState<"flat" | "percent">("flat");
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      formData.set("commissionType", commissionType);
      await upsertRepCommission(formData);
      toast.success("Rep added");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
        <Plus className="size-4" />
        Add rep
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a rep</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="repName">Name</Label>
            <Input id="repName" name="repName" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Commission type</Label>
              <Select value={commissionType} onValueChange={(v) => v && setCommissionType(v as "flat" | "percent")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat ₹ per sale</SelectItem>
                  <SelectItem value="percent">% of sale value</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="commissionRate">Rate</Label>
              <Input id="commissionRate" name="commissionRate" inputMode="decimal" defaultValue="0" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add rep"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
