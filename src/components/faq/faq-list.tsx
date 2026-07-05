"use client";

import { useMemo, useState } from "react";
import { Search, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Markdown } from "@/components/markdown";
import { reorderFaqItems } from "@/app/team/faq/actions";
import { FaqEditorDialog } from "./faq-editor-dialog";

type Item = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
};

const UNCATEGORIZED = "General";

export function FaqList({ items: initialItems }: { items: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  const [query, setQuery] = useState("");

  // Resets local (draggable) state when the server sends fresh data, without
  // the extra render+effect round trip a useEffect would need.
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }

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

  const searching = query.trim().length > 0;

  function handleCategoryReorder(category: string, reorderedCategoryItems: Item[]) {
    // Rebuild the full flat list preserving each category's block position,
    // swapping in the new order only for the category that was dragged in —
    // this keeps category grouping stable while giving that category a real
    // sequential `order` in the database.
    const next: Item[] = [];
    for (const [cat, catItems] of grouped) {
      next.push(...(cat === category ? reorderedCategoryItems : catItems));
    }
    setItems(next);
    reorderFaqItems(next.map((i) => i.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions and answers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-card pl-9"
          />
        </div>
        <FaqEditorDialog />
      </div>

      {grouped.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-card/50 p-10 text-center text-sm text-muted-foreground">
          No matching questions.
        </p>
      ) : (
        grouped.map(([category, categoryItems]) => (
          <div key={category}>
            <h2 className="mb-2.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {category}
            </h2>
            {searching ? (
              <FaqCategoryAccordion category={category} items={categoryItems} draggable={false} />
            ) : (
              <FaqCategoryAccordion
                category={category}
                items={categoryItems}
                draggable
                onReorder={(reordered) => handleCategoryReorder(category, reordered)}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}

function FaqCategoryAccordion({
  category,
  items,
  draggable,
  onReorder,
}: {
  category: string;
  items: Item[];
  draggable: boolean;
  onReorder?: (items: Item[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorder) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  const content = (
    <Accordion className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {items.map((item) =>
        draggable ? (
          <SortableFaqItem key={item.id} item={item} />
        ) : (
          <FaqAccordionItem key={item.id} item={item} />
        )
      )}
    </Accordion>
  );

  if (!draggable) return content;

  return (
    <DndContext
      id={`faq-reorder-${category}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {content}
      </SortableContext>
    </DndContext>
  );
}

function FaqAccordionItem({
  item,
  itemRef,
  style,
  dragHandleProps,
}: {
  item: Item;
  itemRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
}) {
  return (
    <AccordionItem ref={itemRef} style={style} value={item.id} className="group px-5">
      <div className="flex items-center gap-1">
        {dragHandleProps && (
          <button
            type="button"
            {...dragHandleProps}
            className="cursor-grab touch-none px-1 py-2 text-muted-foreground/40 opacity-0 group-hover:opacity-100 hover:text-muted-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-3.5" />
          </button>
        )}
        <AccordionTrigger className="flex-1 text-left text-sm font-medium">
          {item.question}
        </AccordionTrigger>
        <FaqEditorDialog item={item} />
      </div>
      <AccordionContent>
        <Markdown content={item.answer} className="prose-sm" />
      </AccordionContent>
    </AccordionItem>
  );
}

function SortableFaqItem({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <FaqAccordionItem
      item={item}
      itemRef={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}
