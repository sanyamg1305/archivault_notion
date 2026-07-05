"use client";

import { useRouter, usePathname } from "next/navigation";

export function WikiMobileNav({
  pages,
}: {
  pages: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const activeSlug = pathname.split("/team/wiki/")[1];

  return (
    <select
      className="w-full rounded-md border bg-background px-3 py-2 text-sm md:hidden"
      value={activeSlug ?? ""}
      onChange={(e) => router.push(`/team/wiki/${e.target.value}`)}
    >
      {!activeSlug && <option value="" disabled>Choose a page…</option>}
      {pages.map((p) => (
        <option key={p.slug} value={p.slug}>
          {p.title}
        </option>
      ))}
    </select>
  );
}
