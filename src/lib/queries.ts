import { db } from "@/lib/db";
import { toNumber } from "@/lib/format";

export interface Overview {
  totalIncome: number;
  totalExpense: number;
  net: number;
  activeStudents: number;
  activeTeachers: number;
}

export async function getOverview(): Promise<Overview> {
  const [income, expense, students, teachers] = await Promise.all([
    db.transaction.aggregate({
      where: { type: "INCOME" },
      _sum: { amount: true },
    }),
    db.transaction.aggregate({
      where: { type: "EXPENSE" },
      _sum: { amount: true },
    }),
    db.student.count({ where: { status: "active" } }),
    db.teacher.count({ where: { status: "active" } }),
  ]);
  const totalIncome = toNumber(income._sum.amount ?? 0);
  const totalExpense = toNumber(expense._sum.amount ?? 0);
  return {
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    activeStudents: students,
    activeTeachers: teachers,
  };
}

export interface MonthPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
}

export async function getMonthlySeries(months = 12): Promise<MonthPoint[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const transactions = await db.transaction.findMany({
    where: { date: { gte: start } },
    select: { type: true, amount: true, date: true },
  });

  const buckets = new Map<string, MonthPoint>();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.set(key, {
      key,
      label: d.toLocaleDateString("ar-EG", { month: "short" }),
      income: 0,
      expense: 0,
    });
  }

  for (const t of transactions) {
    const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
    const point = buckets.get(key);
    if (!point) continue;
    if (t.type === "INCOME") point.income += toNumber(t.amount);
    else point.expense += toNumber(t.amount);
  }
  return Array.from(buckets.values());
}

export interface CategoryTotal {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
  total: number;
}

export async function getCategoryBreakdown(): Promise<CategoryTotal[]> {
  const categories = await db.category.findMany({ include: { transactions: true } });
  return categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type as "INCOME" | "EXPENSE",
      total: c.transactions.reduce((sum, t) => sum + toNumber(t.amount), 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

export interface StudentBalance {
  id: number;
  name: string;
  teacherName: string | null;
  monthlyFee: number;
  paid: number;
  due: number;
  balance: number;
}

function monthsSince(from: Date, to: Date): number {
  const m = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.max(0, m + 1);
}

export async function getStudentBalances(): Promise<StudentBalance[]> {
  const students = await db.student.findMany({
    where: { status: "active" },
    include: {
      teacher: { select: { name: true } },
      transactions: {
        where: { type: "INCOME" },
        select: { amount: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  return students.map((s) => {
    const fee = toNumber(s.monthlyFee);
    const due = Math.round(fee * monthsSince(s.joinDate, now) * 100) / 100;
    const paid = Math.round(s.transactions.reduce((sum, t) => sum + toNumber(t.amount), 0) * 100) / 100;
    return {
      id: s.id,
      name: s.name,
      teacherName: s.teacher?.name ?? null,
      monthlyFee: fee,
      paid,
      due,
      balance: Math.round((due - paid) * 100) / 100,
    };
  });
}

export interface FinanceQuery {
  type?: "INCOME" | "EXPENSE";
  month?: string;
  q?: string;
}

export interface TransactionRow {
  id: number;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: Date;
  description: string | null;
  categoryName: string;
  studentName: string | null;
  teacherName: string | null;
}

export async function getTransactions(query: FinanceQuery): Promise<TransactionRow[]> {
  const where: Record<string, unknown> = {};
  if (query.type) where.type = query.type;
  if (query.month) {
    const [y, m] = query.month.split("-").map(Number);
    if (y && m) {
      const from = new Date(y, m - 1, 1);
      const to = new Date(y, m, 1);
      where.date = { gte: from, lt: to };
    }
  }
  if (query.q) {
    where.OR = [
      { description: { contains: query.q, mode: "insensitive" } },
      { student: { name: { contains: query.q, mode: "insensitive" } } },
      { teacher: { name: { contains: query.q, mode: "insensitive" } } },
    ];
  }

  const rows = await db.transaction.findMany({
    where,
    include: {
      category: { select: { name: true } },
      student: { select: { name: true } },
      teacher: { select: { name: true } },
    },
    orderBy: { date: "desc" },
    take: 500,
  });

  return rows.map((r) => ({
    id: r.id,
    type: r.type as "INCOME" | "EXPENSE",
    amount: toNumber(r.amount),
    date: r.date,
    description: r.description,
    categoryName: r.category.name,
    studentName: r.student?.name ?? null,
    teacherName: r.teacher?.name ?? null,
  }));
}

export async function getMonthOptions(): Promise<Array<{ value: string; label: string }>> {
  const rows = await db.transaction.findMany({
    select: { date: true },
    orderBy: { date: "asc" },
    distinct: ["date"],
    take: 1,
  });
  const first = rows[0]?.date ?? new Date();
  const now = new Date();
  const out: Array<{ value: string; label: string }> = [];
  for (
    let d = new Date(first.getFullYear(), first.getMonth(), 1);
    d <= now;
    d = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  ) {
    out.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("ar-EG", { month: "long", year: "numeric" }),
    });
  }
  return out.reverse();
}
