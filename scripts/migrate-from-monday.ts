/**
 * One-time migration: pull Opportunities / Companies / Contacts out of monday.com
 * into the app's own Postgres DB. After this runs, monday.com is no longer the
 * source of truth for this system (per the CEO's "fully independent" decision).
 *
 * Usage:
 *   MONDAY_API_TOKEN=xxx DATABASE_URL=postgres://... npx tsx scripts/migrate-from-monday.ts
 *
 * Board IDs are from the archi-tech-bunch production account (workspace CRM 7056901):
 *   Opportunities (הזדמנויות)   5100374305
 *   Companies (חברות ולקוחות)   5100380244
 *   Contacts (אנשי קשר)         5100374304
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  log: ["error"],
});
const TOKEN = process.env.MONDAY_API_TOKEN;
const API = "https://api.monday.com/v2";

const BOARDS = {
  opportunities: "5100374305",
  companies: "5100380244",
  contacts: "5100374304",
};

const STAGE_MAP: Record<string, string> = {
  "הזדמנות חדשה": "NEW",
  "אפיון דרישה": "REQUIREMENTS",
  "נשלחה הצעת מחיר": "QUOTE_SENT",
  "פולאפ על הצעה": "FOLLOW_UP",
  "עסקה נסגרה": "CLOSED_WON",
  "עסקה נפלה": "CLOSED_LOST",
};

async function gql(query: string) {
  if (!TOKEN) throw new Error("MONDAY_API_TOKEN is required");
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: TOKEN },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

function colText(item: any, id: string): string | undefined {
  const c = item.column_values.find((cv: any) => cv.id === id);
  return c?.text || undefined;
}

async function fetchBoard(boardId: string) {
  const data = await gql(`
    query {
      boards(ids: ${boardId}) {
        items_page(limit: 500) {
          items {
            id
            name
            column_values { id text }
          }
        }
      }
    }
  `);
  return data.boards[0]?.items_page?.items ?? [];
}

async function main() {
  console.log("Migrating Companies…");
  const companies = await fetchBoard(BOARDS.companies);
  for (const it of companies) {
    await prisma.company.upsert({
      where: { mondayId: it.id },
      update: {},
      create: {
        mondayId: it.id,
        name: it.name,
        registrationNo: colText(it, "text_mm59s473"),
        isCustomer: colText(it, "color_mm5esd2t") === "כן",
        billingEmail: colText(it, "text_mm597mqj"),
        info: colText(it, "long_text_mm5ejwy8"),
      },
    });
  }
  console.log(`  ${companies.length} companies`);

  console.log("Migrating Contacts…");
  const contacts = await fetchBoard(BOARDS.contacts);
  for (const it of contacts) {
    await prisma.contact.upsert({
      where: { mondayId: it.id },
      update: {},
      create: {
        mondayId: it.id,
        fullName: it.name,
        firstName: colText(it, "text_mm5ejq0f"),
        lastName: colText(it, "text_mm5erkx6"),
        phone: colText(it, "contact_phone"),
        email: colText(it, "contact_email"),
      },
    });
  }
  console.log(`  ${contacts.length} contacts`);

  console.log("Migrating Opportunities…");
  const opps = await fetchBoard(BOARDS.opportunities);
  for (const it of opps) {
    const company = colText(it, "text_mm5e8g6s");
    const linkedCompany = company
      ? await prisma.company.findFirst({ where: { name: company } })
      : null;
    const valueText = colText(it, "deal_value");
    await prisma.opportunity.upsert({
      where: { mondayId: it.id },
      update: {},
      create: {
        mondayId: it.id,
        name: it.name,
        corporateName: company,
        registrationNo: colText(it, "text_mm5efd1y"),
        stage: (STAGE_MAP[colText(it, "deal_stage") ?? ""] ?? "NEW") as never,
        requestedService: colText(it, "dropdown_mm5eb8pv"),
        value: valueText ? Number(valueText.replace(/[^0-9.]/g, "")) : null,
        website: colText(it, "link_mm5eybg0"),
        aiSummary: colText(it, "text_mm5e5gh3"),
        source: colText(it, "dropdown_mm59xr6w"),
        companyId: linkedCompany?.id,
      },
    });
  }
  console.log(`  ${opps.length} opportunities`);
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
