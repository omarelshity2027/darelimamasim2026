"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  createTeacher,
  updateTeacher,
} from "@/lib/actions/teachers";
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

export interface TeacherDTO {
  id: number;
  name: string;
  phone: string | null;
  salary: number;
  joinDate: string;
  notes: string | null;
}

export function TeacherDialog({ teacher }: { teacher?: TeacherDTO }) {
  const isEdit = Boolean(teacher);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = isEdit
      ? await updateTeacher(undefined, formData)
      : await createTeacher(undefined, formData);
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
        {isEdit ? (
          <Button variant="ghost" size="sm" className="gap-1">
            <Pencil className="size-4" />
            تعديل
          </Button>
        ) : (
          <Button>إضافة معلم</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل بيانات المعلم" : "إضافة معلم جديد"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "حدّث بيانات المعلم ثم احفظ التغييرات." : "أدخل بيانات المعلم ثم احفظ."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" noValidate>
          <input type="hidden" name="id" value={teacher?.id ?? ""} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المعلم *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={teacher?.name ?? ""}
                placeholder="مثال: الشيخ محمد"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                dir="ltr"
                defaultValue={teacher?.phone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">الراتب الشهري (ج.م)</Label>
              <Input
                id="salary"
                name="salary"
                type="number"
                min="0"
                step="0.01"
                defaultValue={teacher ? String(teacher.salary) : ""}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinDate">تاريخ الالتحاق</Label>
              <Input
                id="joinDate"
                name="joinDate"
                type="date"
                defaultValue={
                  teacher ? formatDateInput(teacher.joinDate) : formatDateInput(new Date())
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                defaultValue={teacher?.notes ?? ""}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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
