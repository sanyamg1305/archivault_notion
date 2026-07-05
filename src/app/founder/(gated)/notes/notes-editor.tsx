"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { saveFounderNote } from "./actions";

type SaveState = "idle" | "saving" | "saved";

export function NotesEditor({
  initialContent,
  initialUpdatedAt,
}: {
  initialContent: string;
  initialUpdatedAt: Date;
}) {
  const [content, setContent] = useState(initialContent);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [state, setState] = useState<SaveState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleChange(value: string) {
    setContent(value);
    setState("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      const result = await saveFounderNote(value);
      setUpdatedAt(result.updatedAt);
      setState("saved");
    }, 800);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-2xl border bg-card p-2 shadow-sm">
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          rows={20}
          className="resize-none border-0 font-mono text-sm shadow-none focus-visible:ring-0"
          placeholder="Private notes only founders can see…"
        />
      </div>
      <p className="px-1 text-xs text-muted-foreground">
        {state === "saving" ? "Saving…" : `Last saved ${updatedAt.toLocaleString()}`}
      </p>
    </div>
  );
}
