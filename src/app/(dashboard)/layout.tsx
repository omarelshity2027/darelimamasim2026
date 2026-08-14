import { requireAuth } from "@/lib/dal";
import { Sidebar } from "@/components/layout/sidebar";
import { LogoutButton } from "@/components/layout/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="flex min-h-svh bg-muted/30">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
          <p className="text-sm font-semibold text-muted-foreground">
            دار الإمام عاصم لتحفيظ القرآن الكريم
          </p>
          <LogoutButton />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
