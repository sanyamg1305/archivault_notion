"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Markdown } from "@/components/markdown";
import { FaqEditorDialog } from "./faq-editor-dialog";

type Item = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
};

const UNCATEGORIZED = "General";

export function FaqList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.question.toLowerCase().includes(q) ||
        i.answer.toLowerCase().includes(q) ||
        (i.category ?? "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const item of filtered) {
      const key = item.category || UNCATEGORIZED;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions and answers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <FaqEditorDialog />
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No matching questions.
        </p>
      ) : (
        grouped.map(([category, categoryItems]) => (
          <div key={category}>
            <h2 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              {category}
            </h2>
            <Accordion className="rounded-xl border">
              {categoryItems.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="px-4">
                  <div className="flex items-center gap-2">
                    <AccordionTrigger className="flex-1 text-left text-sm font-medium">
                      {item.question}
                    </AccordionTrigger>
                    <FaqEditorDialog item={item} />
                  </div>
                  <AccordionContent>
                    <Markdown content={item.answer} className="prose-sm" />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))
      )}
    </div>
  );
}
