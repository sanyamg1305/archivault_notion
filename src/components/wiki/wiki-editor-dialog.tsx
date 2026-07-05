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
import {
  createWikiPage,
  updateWikiPage,
  deleteWikiPage,
} from "@/app/team/wiki/actions";

type Page = { id: string; slug: string; title: string; content: string };

export function WikiEditorDialog({ page }: { page?: Page }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const mode = page ? "edit" : "create";

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createWikiPage(formData);
        } else if (page) {
          await updateWikiPage(page.id, formData);
        }
      } catch (err) {
        // redirect() throws internally on success — only report real errors
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          toast.error(err.message);
        }
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
            <Button size="sm" variant="outline" className="gap-1.5" />
          )
        }
      >
        {mode === "create" ? (
          <>
            <Plus className="size-4" />
            New page
          </>
        ) : (
          <>
            <Pencil className="size-3.5" />
            Edit
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New wiki page" : "Edit page"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={page?.title} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="what-is-archivault"
                defaultValue={page?.slug}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Content (markdown)</Label>
            <Textarea
              id="content"
              name="content"
              rows={14}
              className="font-mono text-sm"
              defaultValue={page?.content}
            />
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            {mode === "edit" && page && (
              <Button
                type="button"
                variant="ghost"
                className="gap-1.5 text-destructive hover:text-destructive"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteWikiPage(page.id, page.slug);
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
