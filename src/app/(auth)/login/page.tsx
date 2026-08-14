import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
            ق
          </div>
          <h1 className="text-xl font-bold">دار الإمام عاصم</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            نظام إدارة الدار — تسجيل الدخول
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
