"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function WikiSidebarNav({
  pages,
}: {
  pages: { id: string; slug: string; title: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {pages.map((p) => {
        const href = `/team/wiki/${p.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={p.id}
            href={href}
            className={cn(
              "truncate rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-foreground/70 hover:bg-accent hover:text-foreground"
            )}
          >
            {p.title}
          </Link>
        );
      })}
    </nav>
  );
}
