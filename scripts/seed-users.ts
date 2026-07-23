// Seeds initial user accounts with hashed passwords.
// Run: npx tsx scripts/seed-users.ts
// NOTE: these are DEV/TEST accounts with a placeholder password — rotate before real use.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEV_PASSWORD = "ChangeMe123!"; // placeholder — must be rotated per user

const USERS: { email: string; name: string; role: "REP" | "APPROVER" | "ADMIN" }[] = [
  { email: "idan_nevet@archi-tech.io", name: "Idan Nevet", role: "APPROVER" },
  { email: "yarin@archi-tech.io", name: "Yarin", role: "APPROVER" },
  { email: "yarden@archi-tech.io", name: "Yarden", role: "APPROVER" },
  { email: "arslan@archi-tech.io", name: "Arslan Manzoor", role: "ADMIN" },
];

async function main() {
  const hash = await bcrypt.hash(DEV_PASSWORD, 10);
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash: hash },
      create: { email: u.email, name: u.name, role: u.role, passwordHash: hash },
    });
    console.log(`seeded ${u.role.padEnd(8)} ${u.email}`);
  }
  console.log(`\nAll seeded with dev password: ${DEV_PASSWORD}  (ROTATE before real use)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
