"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function Shell({
  navItems,
  sectionLabel,
  accent = false,
  footer,
  children,
}: {
  navItems: NavItem[];
  sectionLabel: string;
  /** Founder Mode styling — swaps the neutral mark for the brand accent. */
  accent?: boolean;
  /** Optional sidebar footer content (e.g. an "Exit Founder Mode" action). */
  footer?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-1 bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <SidebarHeader sectionLabel={sectionLabel} accent={accent} />
        {nav}
        {footer && <div className="border-t p-3">{footer}</div>}
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b bg-sidebar px-4 py-3 text-sidebar-foreground md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 bg-sidebar p-0 text-sidebar-foreground"
            >
              <SheetHeader className="border-b p-0">
                <SheetTitle className="sr-only">{sectionLabel} navigation</SheetTitle>
                <SidebarHeader sectionLabel={sectionLabel} accent={accent} />
              </SheetHeader>
              <div className="flex flex-1 flex-col">
                {nav}
                {footer && <div className="border-t p-3">{footer}</div>}
              </div>
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold">{sectionLabel}</span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarHeader({
  sectionLabel,
  accent,
}: {
  sectionLabel: string;
  accent: boolean;
}) {
  return (
    <div className="flex items-center gap-2 border-b px-4 py-4">
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-md text-sm font-bold",
          accent
            ? "bg-brand text-brand-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        A
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">Archivault</span>
        <span className="text-xs text-sidebar-foreground/60">
          {sectionLabel}
        </span>
      </div>
    </div>
  );
}
