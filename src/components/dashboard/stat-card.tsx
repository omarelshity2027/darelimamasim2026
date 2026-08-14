import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "danger" | "info";
}) {
  const tones: Record<string, string> = {
    default: "bg-muted text-foreground",
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-sky-100 text-sky-700",
  };
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("flex size-9 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="size-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
