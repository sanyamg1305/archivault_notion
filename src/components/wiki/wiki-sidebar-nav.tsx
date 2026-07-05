"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GripVertical } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { reorderWikiPages } from "@/app/team/wiki/actions";

type Page = { id: string; slug: string; title: string };

export function WikiSidebarNav({ pages: initialPages }: { pages: Page[] }) {
  const pathname = usePathname();
  const [pages, setPages] = useState(initialPages);
  const [prevInitialPages, setPrevInitialPages] = useState(initialPages);

  // Resets local (draggable) state when the server sends fresh data, without
  // the extra render+effect round trip a useEffect would need.
  if (initialPages !== prevInitialPages) {
    setPrevInitialPages(initialPages);
    setPages(initialPages);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(pages, oldIndex, newIndex);
    setPages(reordered);
    reorderWikiPages(reordered.map((p) => p.id));
  }

  return (
    <DndContext
      id="wiki-sidebar-reorder"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <nav className="flex flex-col gap-0.5">
          {pages.map((p) => (
            <SortableWikiLink key={p.id} page={p} active={pathname === `/team/wiki/${p.slug}`} />
          ))}
        </nav>
      </SortableContext>
    </DndContext>
  );
}

function SortableWikiLink({ page, active }: { page: Page; active: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: page.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-1 rounded-lg pr-2 transition-colors",
        active ? "bg-primary/10" : "hover:bg-accent",
        isDragging && "opacity-50"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none px-1.5 py-2 text-muted-foreground/40 opacity-0 group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-3.5" />
      </button>
      <Link
        href={`/team/wiki/${page.slug}`}
        className={cn(
          "flex-1 truncate py-2 text-sm transition-colors",
          active ? "font-medium text-primary" : "text-foreground/70 group-hover:text-foreground"
        )}
      >
        {page.title}
      </Link>
    </div>
  );
}
