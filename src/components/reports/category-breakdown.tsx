import { getCategoryBreakdown } from "@/lib/queries";
import { formatMoney } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function CategoryBreakdown() {
  const breakdown = await getCategoryBreakdown();
  const max = breakdown[0]?.total ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">توزيع الحركات حسب الفئة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {breakdown.length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد حركات بعد</p>
        )}
        {breakdown.map((c) => (
          <div key={c.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{c.name}</span>
              <span
                className={
                  c.type === "INCOME" ? "font-semibold text-emerald-700" : "font-semibold text-red-700"
                }
              >
                {formatMoney(c.total)}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={
                  c.type === "INCOME"
                    ? "h-2 rounded-full bg-emerald-600"
                    : "h-2 rounded-full bg-red-600"
                }
                style={{ width: `${Math.max((c.total / max) * 100, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
