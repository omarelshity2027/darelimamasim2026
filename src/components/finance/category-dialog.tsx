"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createCategory } from "@/lib/actions/finance";
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

export function CategoryDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = await createCategory(undefined, formData);
    if (result.success) {
      toast.success(result.success);
      setOpen(false);
    } else if (result.error) {
      toast.error(result.error);
    }
    setPending(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1">
          <Plus className="size-4" />
          إضافة فئة
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة فئة مالية</DialogTitle>
          <DialogDescription>أضف فئة جديدة للإيرادات أو المصروفات.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">اسم الفئة *</Label>
            <Input id="name" name="name" required placeholder="مثال: كتب ومصاحف" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">النوع *</Label>
            <select
              id="type"
              name="type"
              defaultValue="INCOME"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="INCOME">إيراد</option>
              <option value="EXPENSE">مصروف</option>
            </select>
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
