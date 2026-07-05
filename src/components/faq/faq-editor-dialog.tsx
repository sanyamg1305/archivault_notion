"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createFaqItem, updateFaqItem, deleteFaqItem } from "@/app/team/faq/actions";

type Item = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
};

export function FaqEditorDialog({ item }: { item?: Item }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const mode = item ? "edit" : "create";

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createFaqItem(formData);
        } else if (item) {
          await updateFaqItem(item.id, formData);
        }
        toast.success(mode === "create" ? "FAQ added" : "FAQ saved");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "create" ? (
            <Button size="sm" className="gap-1.5" />
          ) : (
            <Button size="icon" variant="ghost" className="size-7" />
          )
        }
      >
        {mode === "create" ? (
          <>
            <Plus className="size-4" />
            Add FAQ
          </>
        ) : (
          <Pencil className="size-3.5" />
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add FAQ" : "Edit FAQ"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              placeholder="Pricing objections, Product questions…"
              defaultValue={item?.category ?? ""}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="question">Question</Label>
            <Input id="question" name="question" defaultValue={item?.question} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="answer">Answer (markdown)</Label>
            <Textarea
              id="answer"
              name="answer"
              rows={6}
              defaultValue={item?.answer}
              required
            />
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            {mode === "edit" && item && (
              <Button
                type="button"
                variant="ghost"
                className="gap-1.5 text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteFaqItem(item.id);
                    setOpen(false);
                  })
                }
              >
                <Trash2 className="size-3.5" />
                Delete
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
