import { redirect } from "next/navigation";
import { Users, NotebookText, ListTodo, ArrowLeftCircle, Lock } from "lucide-react";
import { isFounderUnlocked, clearFounderUnlockCookie } from "@/lib/founder-passphrase";
import { Shell, type NavItem } from "@/components/shell";
import { Button } from "@/components/ui/button";

const navItems: NavItem[] = [
  { href: "/founder/team-tracker", label: "Team Tracker", icon: <Users className="size-4" /> },
  { href: "/founder/notes", label: "Private Notes", icon: <NotebookText className="size-4" /> },
  { href: "/founder/leads", label: "All Leads", icon: <ListTodo className="size-4" /> },
  { href: "/team/leads", label: "Back to Team", icon: <ArrowLeftCircle className="size-4" /> },
];

export default async function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side, signature-verified check — the proxy's cookie-presence
  // check is only an optimistic fast path, this is the real gate.
  const unlocked = await isFounderUnlocked();
  if (!unlocked) {
    redirect("/founder/passphrase");
  }

  async function exitFounderMode() {
    "use server";
    await clearFounderUnlockCookie();
    redirect("/team/leads");
  }

  return (
    <Shell
      navItems={navItems}
      sectionLabel="Founder Mode"
      accent
      footer={
        <form action={exitFounderMode}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:text-sidebar-accent-foreground"
          >
            <Lock className="size-4" />
            Exit Founder Mode
          </Button>
        </form>
      }
    >
      {children}
    </Shell>
  );
}
