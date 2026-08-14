"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createTransaction } from "@/lib/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateInput } from "@/lib/format";

export interface CategoryOption {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
}

export interface PersonOption {
  id: number;
  name: string;
}

export function TransactionDialog({
  categories,
  students,
  teachers,
}: {
  categories: CategoryOption[];
  students: PersonOption[];
  teachers: PersonOption[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [pending, setPending] = useState(false);

  const typeCategories = categories.filter((c) => c.type === type);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await createTransaction(undefined, formData);
    if (result.success) {
      toast.success(result.success);
      setOpen(false);
    } else if (result.error) {
      toast.error(result.error);
    }
    setPending(false);
  }

  const selectClass =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>تسجيل حركة مالية</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تسجيل حركة مالية</DialogTitle>
          <DialogDescription>سجّل إيراداً أو مصروفاً جديداً.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">النوع *</Label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
                className={selectClass}
              >
                <option value="INCOME">إيراد</option>
                <option value="EXPENSE">مصروف</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ (ج.م) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">الفئة *</Label>
              <select id="categoryId" name="categoryId" required className={selectClass}>
                {typeCategories.length === 0 && (
                  <option value="">لا توجد فئات لهذا النوع</option>
                )}
                {typeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">التاريخ</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={formatDateInput(new Date())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">ربط بطالب</Label>
              <select id="studentId" name="studentId" className={selectClass}>
                <option value="">بدون</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherId">ربط بمعلم</Label>
              <select id="teacherId" name="teacherId" className={selectClass}>
                <option value="">بدون</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">وصف / بيان</Label>
              <Input id="description" name="description" placeholder="مثال: قسط شهر سبتمبر" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
