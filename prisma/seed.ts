import { db } from "../src/lib/db";

const CATEGORIES = [
  { name: "رسوم التحفيظ", type: "INCOME" },
  { name: "تبرعات", type: "INCOME" },
  { name: "إيرادات أخرى", type: "INCOME" },
  { name: "رواتب المعلمين", type: "EXPENSE" },
  { name: "مصاريف الدار", type: "EXPENSE" },
  { name: "فواتير (كهرباء/مياه)", type: "EXPENSE" },
  { name: "مصروفات أخرى", type: "EXPENSE" },
] as const;

async function main() {
  for (const c of CATEGORIES) {
    await db.category.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, type: c.type },
    });
  }
  console.log(`[seed] ${CATEGORIES.length} categories ensured`);
}

main()
  .catch((err) => {
    console.error("[seed] failed", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
