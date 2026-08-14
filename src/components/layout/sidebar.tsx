"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/students", label: "الطلاب", icon: Users },
  { href: "/teachers", label: "المعلمون", icon: GraduationCap },
  { href: "/finance", label: "الحسابات", icon: Wallet },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-l bg-card md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
          ق
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">دار الإمام عاصم</p>
          <p className="text-xs text-muted-foreground">نظام الإدارة</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
