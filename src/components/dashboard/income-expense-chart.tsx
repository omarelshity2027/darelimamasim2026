"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export interface MonthPoint {
  key: string;
  label: string;
  income: number;
  expense: number;
}

export function IncomeExpenseChart({ data }: { data: MonthPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">الإيرادات والمصروفات (آخر ١٢ شهراً)</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))}
            />
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
            <Legend />
            <Bar dataKey="income" name="الإيرادات" fill="#16a34a" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="المصروفات" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
