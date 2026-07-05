import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const wikiPages = [
  {
    slug: "what-is-archivault",
    title: "What is Archivault?",
    order: 0,
    content: `Archivault is a project command center built for construction and infra teams — the layer that sits on top of the chaos of site photos, WhatsApp updates, spreadsheets, and paper site reports, and turns it into one organized, always-up-to-date record for every project.

## The problem it solves

Most construction teams run projects across five disconnected tools: WhatsApp for site updates, Excel for budgets and BOQs, email for approvals, a shared drive for photos and drawings, and someone's memory for the rest. Nothing talks to anything else, so by the time a project manager or client asks "what's the real status of Project X," someone has to manually reconstruct the answer.

Archivault replaces that reconstruction work with a single source of truth: every site update, document, budget line, and approval lives in one place, tied to the project it belongs to.

## Who it's for

Construction companies, infrastructure contractors, interior fit-out firms, and real estate developers who are currently managing multiple active sites with spreadsheets and chat apps and have outgrown that setup.`,
  },
  {
    slug: "positioning",
    title: "Positioning: not just PM software",
    order: 1,
    content: `When a prospect says "isn't this just project management software," here's the distinction to draw:

**Generic PM tools** (Asana, Trello, Monday) are built for software and marketing teams — tasks, boards, and timelines. They have no concept of a BOQ, a site report, a material budget, or a client-facing progress update, so construction teams end up bolting on spreadsheets anyway.

**Archivault is purpose-built for physical project delivery.** It understands sites, not just tasks: photos tied to a location and date, budgets tied to material and labor line items, and reports formatted the way clients and site engineers actually expect to see them.

The pitch in one line: *"You don't need another to-do list — you need a system that understands what a construction project actually looks like."*`,
  },
  {
    slug: "modules",
    title: "Module list",
    order: 2,
    content: `Archivault is organized into a few core modules. Not every client needs every module on day one — this is also useful for scoping a smaller starter package.

- **Project Dashboard** — live status across every active site: progress %, budget burn, open issues, upcoming milestones.
- **Site Reports** — structured daily/weekly site updates with photos, weather, manpower counts, and issues logged by site engineers.
- **Document Vault** — drawings, approvals, contracts, and compliance docs, versioned and searchable by project.
- **Budget & BOQ Tracking** — bill of quantities line items tracked against actual spend, with variance flags.
- **Client Portal** — a read-only, branded view clients can check themselves instead of asking for status over WhatsApp.
- **Approvals** — structured sign-off flows for drawings, change orders, and payment milestones.
- **Mini Tools** — a set of quick-use utilities (see the separate Mini Tools page) that work even before a client is fully onboarded to the full platform.`,
  },
  {
    slug: "mini-tools",
    title: "Mini Tools",
    order: 3,
    content: `The Mini Tools are lightweight, standalone utilities inside Archivault. They're useful on their own — which makes them a great low-commitment entry point for a prospect who isn't ready to adopt the full platform yet.

## Site Report Generator
Turns a quick set of photos and notes from site into a clean, shareable PDF/report — the same report a site engineer would otherwise spend 30–45 minutes formatting manually at the end of the day.

## BOQ Generator
Helps put together a structured Bill of Quantities from a project's scope, with standard line items pre-filled so estimators aren't starting from a blank spreadsheet every time.

## Budget Estimator
A fast, directional cost estimate for a project based on type, size, and location — useful in the very early sales conversation with a prospect, before a full BOQ exists.

**Sales angle:** these tools are a great "give them something useful today" opener during a cold call — you can offer a free BOQ or site report generation as a way to get a prospect to actually try Archivault before committing to anything.`,
  },
  {
    slug: "pricing",
    title: "Pricing",
    order: 4,
    content: `> Placeholder — replace with current pricing before sharing externally.

Archivault is priced per active project, with tiers based on which modules a client needs:

- **Starter** — Site Reports + Document Vault only. Good for smaller contractors running 1–3 sites.
- **Growth** — adds Budget & BOQ Tracking and the Client Portal. Most common tier for mid-size contractors.
- **Full Platform** — everything, including Approvals workflows and priority support. Best for larger firms running many concurrent projects.

Mini Tools (Site Report Generator, BOQ Generator, Budget Estimator) can be offered standalone at a lower price point or as a trial hook before a full-platform conversation.`,
  },
];

const faqItems = [
  {
    category: "Pricing objections",
    order: 0,
    question: "This seems expensive compared to just using Excel/WhatsApp.",
    answer:
      "Excel and WhatsApp feel free, but they cost time — every status update someone has to manually chase down, every site report reformatted by hand, every version-control mistake on a drawing. Archivault's cost is usually a fraction of the project value it's protecting, and it pays for itself the first time it prevents one costly miscommunication on site.",
  },
  {
    category: "Pricing objections",
    order: 1,
    question: "Can we just start with one module instead of the full platform?",
    answer:
      "Yes — the Starter tier or even a single Mini Tool (like the Site Report Generator) is a completely valid way to begin. Many clients start with one module and expand once they see it working.",
  },
  {
    category: "Product questions",
    order: 0,
    question: "Do site engineers need to be tech-savvy to use this?",
    answer:
      "No. Site reports can be filled out from a phone in a couple of minutes — photos, a few notes, and a status. The interface is deliberately simple because it's designed to be used standing on an active site, not at a desk.",
  },
  {
    category: "Product questions",
    order: 1,
    question: "What happens to our existing data (old reports, spreadsheets)?",
    answer:
      "We can import existing BOQs and budgets from spreadsheets during onboarding. Historical site reports and photos can be uploaded into the Document Vault so nothing is lost, even if they weren't originally created in Archivault.",
  },
  {
    category: "Competitor comparisons",
    order: 0,
    question: "How is this different from generic tools like Asana or Trello?",
    answer:
      "Those tools manage tasks. Archivault manages a physical project — it understands site reports, BOQs, and budgets natively instead of forcing you to represent construction work as generic to-do cards.",
  },
];

async function main() {
  for (const page of wikiPages) {
    await prisma.wikiPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  for (const item of faqItems) {
    const existing = await prisma.faqItem.findFirst({
      where: { question: item.question },
    });
    if (existing) {
      await prisma.faqItem.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.faqItem.create({ data: item });
    }
  }

  console.log(`Seeded ${wikiPages.length} wiki pages and ${faqItems.length} FAQ items.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
