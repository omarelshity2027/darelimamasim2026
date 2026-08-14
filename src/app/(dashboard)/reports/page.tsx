import type { Metadata } from "next";
import { getOverview, getMonthlySeries, getStudentBalances } from "@/lib/queries";
import { formatMoney } from "@/lib/format";
import { IncomeExpenseChart } from "@/components/dashboard/income-expense-chart";
import { CategoryBreakdown } from "@/components/reports/category-breakdown";
import { CsvExportButton } from "@/components/reports/csv-export-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "التقارير" };

export default async function ReportsPage() {
  const [overview, series, balances] = await Promise.all([
    getOverview(),
    getMonthlySeries(),
    getStudentBalances(),
  ]);

  const csvRows = balances.map((b) => [
    b.name,
    b.teacherName ?? "",
    b.monthlyFee,
    b.due,
    b.paid,
    b.balance,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">التقارير</h1>
          <p className="text-sm text-muted-foreground">
            ملخص مالي وبيان متأخرات الطلاب
          </p>
        </div>
        <CsvExportButton
          filename="mutakhirat-students.csv"
          headers={["الطالب", "المعلم", "المصروف الشهري", "المستحق", "المدفوع", "الرصيد"]}
          rows={csvRows}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ملخص إجمالي</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <p>
            إجمالي الإيرادات:{" "}
            <span className="font-semibold text-emerald-700">
              {formatMoney(overview.totalIncome)}
            </span>
          </p>
          <p>
            إجمالي المصروفات:{" "}
            <span className="font-semibold text-red-700">
              {formatMoney(overview.totalExpense)}
            </span>
          </p>
          <p>
            الصافي: <span className="font-semibold">{formatMoney(overview.net)}</span>
          </p>
          <p>
            متوقع الشهري (طلاب نشطون):{" "}
            <span className="font-semibold">
              {formatMoney(
                balances.reduce((s, b) => s + b.monthlyFee, 0),
              )}
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <IncomeExpenseChart data={series} />
        <CategoryBreakdown />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">متأخرات الطلاب (النشطون)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الطالب</TableHead>
                <TableHead>المعلم</TableHead>
                <TableHead>المصروف الشهري</TableHead>
                <TableHead>المستحق</TableHead>
                <TableHead>المدفوع</TableHead>
                <TableHead>الرصيد المتبقي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balances.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    لا يوجد طلاب نشطون
                  </TableCell>
                </TableRow>
              )}
              {balances.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.teacherName ?? "—"}</TableCell>
                  <TableCell>{formatMoney(b.monthlyFee)}</TableCell>
                  <TableCell>{formatMoney(b.due)}</TableCell>
                  <TableCell className="text-emerald-700">{formatMoney(b.paid)}</TableCell>
                  <TableCell
                    className={
                      b.balance > 0
                        ? "font-semibold text-red-700"
                        : "font-semibold text-emerald-700"
                    }
                  >
                    {formatMoney(b.balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
