import { Contact, BookOpen, HelpCircle, ShieldCheck } from "lucide-react";
import { Shell, type NavItem } from "@/components/shell";

const navItems: NavItem[] = [
  { href: "/team/leads", label: "Leads", icon: <Contact className="size-4" /> },
  { href: "/team/wiki", label: "Wiki", icon: <BookOpen className="size-4" /> },
  { href: "/team/faq", label: "FAQ", icon: <HelpCircle className="size-4" /> },
  { href: "/founder", label: "Founder Mode", icon: <ShieldCheck className="size-4" /> },
];

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <Shell navItems={navItems} sectionLabel="Team">
      {children}
    </Shell>
  );
}
