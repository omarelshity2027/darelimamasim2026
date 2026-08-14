import type { Metadata } from "next";
import { TrendingUp, TrendingDown, Scale, Users, GraduationCap } from "lucide-react";
import { getOverview, getMonthlySeries } from "@/lib/queries";
import { formatMoney } from "@/lib/format";
import { StatCard } from "@/components/dashboard/stat-card";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "لوحة التحكم" };

export default async function DashboardPage() {
  const [overview, series] = await Promise.all([getOverview(), getMonthlySeries()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">نظرة عامة على الدار</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatMoney(overview.totalIncome)}
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          title="إجمالي المصروفات"
          value={formatMoney(overview.totalExpense)}
          icon={TrendingDown}
          tone="danger"
        />
        <StatCard
          title="الصافي"
          value={formatMoney(overview.net)}
          icon={Scale}
          tone={overview.net >= 0 ? "info" : "danger"}
        />
        <StatCard
          title="الطلاب النشطون"
          value={String(overview.activeStudents)}
          icon={Users}
        />
        <StatCard
          title="المعلمون النشطون"
          value={String(overview.activeTeachers)}
          icon={GraduationCap}
        />
      </div>

      <IncomeExpenseChart data={series} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">آخر الشهور</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {series
            .slice(-3)
            .reverse()
            .map((m) => (
              <div
                key={m.key}
                className="rounded-lg border p-3 text-sm"
              >
                <p className="font-medium">{m.label}</p>
                <p className="mt-1 text-emerald-700">إيرادات: {formatMoney(m.income)}</p>
                <p className="text-red-700">مصروفات: {formatMoney(m.expense)}</p>
                <p className="mt-1 font-semibold">
                  الصافي: {formatMoney(m.income - m.expense)}
                </p>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
