import type { Metadata } from "next";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/dal";
import { getTransactions, getMonthOptions } from "@/lib/queries";
import { deleteTransaction } from "@/lib/actions/finance";
import { formatMoney, formatDate } from "@/lib/format";
import { TransactionDialog, type CategoryOption, type PersonOption } from "@/components/finance/transaction-dialog";
import { CategoryDialog } from "@/components/finance/category-dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "الحسابات" };

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; month?: string; q?: string }>;
}) {
  await requireAuth();
  const params = await searchParams;
  const type = params.type === "EXPENSE" ? "EXPENSE" : params.type === "INCOME" ? "INCOME" : undefined;
  const month = params.month || undefined;
  const q = (params.q ?? "").trim();

  const [rows, categories, students, teachers, monthOptions] = await Promise.all([
    getTransactions({ type, month, q: q || undefined }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.student.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.teacher.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getMonthOptions(),
  ]);

  const totalIncome = rows
    .filter((r) => r.type === "INCOME")
    .reduce((s, r) => s + r.amount, 0);
  const totalExpense = rows
    .filter((r) => r.type === "EXPENSE")
    .reduce((s, r) => s + r.amount, 0);

  const categoryOptions: CategoryOption[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type as "INCOME" | "EXPENSE",
  }));
  const studentOptions: PersonOption[] = students.map((s) => ({ id: s.id, name: s.name }));
  const teacherOptions: PersonOption[] = teachers.map((t) => ({ id: t.id, name: t.name }));

  const selectClass =
    "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الحسابات</h1>
          <p className="text-sm text-muted-foreground">الحركات المالية والإيرادات والمصروفات</p>
        </div>
        <div className="flex gap-2">
          <CategoryDialog />
          <TransactionDialog
            categories={categoryOptions}
            students={studentOptions}
            teachers={teacherOptions}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="الإيرادات (ضمن الفلتر)"
          value={formatMoney(totalIncome)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          title="المصروفات (ضمن الفلتر)"
          value={formatMoney(totalExpense)}
          icon={TrendingDown}
          tone="danger"
        />
        <StatCard
          title="الصافي"
          value={formatMoney(totalIncome - totalExpense)}
          icon={Scale}
          tone={totalIncome - totalExpense >= 0 ? "info" : "danger"}
        />
      </div>

      <form method="get" action="/finance" className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">النوع</label>
          <select name="type" defaultValue={type ?? ""} className={selectClass}>
            <option value="">الكل</option>
            <option value="INCOME">إيرادات</option>
            <option value="EXPENSE">مصروفات</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">الشهر</label>
          <select name="month" defaultValue={month ?? ""} className={selectClass}>
            <option value="">كل الشهور</option>
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 min-w-40 space-y-1">
          <label className="text-xs text-muted-foreground">بحث</label>
          <Input name="q" defaultValue={q} placeholder="بيان، طالب، أو معلم..." />
        </div>
        <Button type="submit" variant="secondary">
          تصفية
        </Button>
        {(type || month || q) && (
          <Button asChild variant="ghost">
            <a href="/finance">إلغاء الفلتر</a>
          </Button>
        )}
      </form>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>البيان</TableHead>
              <TableHead>طالب / معلم</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead className="text-left">حذف</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  لا توجد حركات مالية
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{formatDate(r.date)}</TableCell>
                <TableCell>
                  <Badge variant={r.type === "INCOME" ? "default" : "destructive"}>
                    {r.type === "INCOME" ? "إيراد" : "مصروف"}
                  </Badge>
                </TableCell>
                <TableCell>{r.categoryName}</TableCell>
                <TableCell>{r.description ?? "—"}</TableCell>
                <TableCell>{r.studentName ?? r.teacherName ?? "—"}</TableCell>
                <TableCell
                  className={
                    r.type === "INCOME"
                      ? "font-semibold text-emerald-700"
                      : "font-semibold text-red-700"
                  }
                >
                  {r.type === "INCOME" ? "+" : "-"}
                  {formatMoney(r.amount)}
                </TableCell>
                <TableCell className="text-left">
                  <form action={deleteTransaction.bind(null, r.id)}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      حذف
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
