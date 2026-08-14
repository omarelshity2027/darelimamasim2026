"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  createStudent,
  updateStudent,
} from "@/lib/actions/students";
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

export interface StudentDTO {
  id: number;
  name: string;
  phone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  teacherId: number | null;
  monthlyFee: number;
  joinDate: string;
  notes: string | null;
  status: string;
}

export interface TeacherOption {
  id: number;
  name: string;
}

export function StudentDialog({
  student,
  teachers,
}: {
  student?: StudentDTO;
  teachers: TeacherOption[];
}) {
  const isEdit = Boolean(student);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    const result = isEdit
      ? await updateStudent(undefined, formData)
      : await createStudent(undefined, formData);
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
          <Button>إضافة طالب</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل بيانات الطالب" : "إضافة طالب جديد"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "حدّث بيانات الطالب ثم احفظ التغييرات." : "أدخل بيانات الطالب ثم احفظ."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4" noValidate>
          <input type="hidden" name="id" value={student?.id ?? ""} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الطالب *</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={student?.name ?? ""}
                placeholder="مثال: أحمد محمد"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                name="phone"
                dir="ltr"
                defaultValue={student?.phone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianName">اسم ولي الأمر</Label>
              <Input
                id="guardianName"
                name="guardianName"
                defaultValue={student?.guardianName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardianPhone">هاتف ولي الأمر</Label>
              <Input
                id="guardianPhone"
                name="guardianPhone"
                dir="ltr"
                defaultValue={student?.guardianPhone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacherId">المعلم</Label>
              <select
                id="teacherId"
                name="teacherId"
                defaultValue={student?.teacherId?.toString() ?? ""}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">بدون معلم</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyFee">المصروف الشهري (ج.م)</Label>
              <Input
                id="monthlyFee"
                name="monthlyFee"
                type="number"
                min="0"
                step="0.01"
                defaultValue={student ? String(student.monthlyFee) : ""}
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
                  student ? formatDateInput(student.joinDate) : formatDateInput(new Date())
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                defaultValue={student?.notes ?? ""}
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
