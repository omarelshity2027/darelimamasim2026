import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/dal";
import { toggleTeacherStatus } from "@/lib/actions/teachers";
import { formatMoney, formatDate, toNumber } from "@/lib/format";
import { TeacherDialog, type TeacherDTO } from "@/components/teachers/teacher-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "المعلمون" };

export default async function TeachersPage() {
  await requireAuth();
  const teachers = await db.teacher.findMany({
    include: { _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });

  const rows: Array<TeacherDTO & { studentCount: number; status: string }> = teachers.map(
    (t) => ({
      id: t.id,
      name: t.name,
      phone: t.phone,
      salary: toNumber(t.salary),
      joinDate: t.joinDate.toISOString(),
      notes: t.notes,
      studentCount: t._count.students,
      status: t.status,
    }),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">المعلمون</h1>
          <p className="text-sm text-muted-foreground">
            إدارة معلمي الدار — {rows.length} معلم
          </p>
        </div>
        <TeacherDialog />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الراتب الشهري</TableHead>
              <TableHead>عدد الطلاب</TableHead>
              <TableHead>تاريخ الالتحاق</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  لا يوجد معلمون
                </TableCell>
              </TableRow>
            )}
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell dir="ltr" className="text-left">{t.phone ?? "—"}</TableCell>
                <TableCell>{formatMoney(t.salary)}</TableCell>
                <TableCell>{t.studentCount}</TableCell>
                <TableCell>{formatDate(t.joinDate)}</TableCell>
                <TableCell>
                  <Badge variant={t.status === "active" ? "default" : "secondary"}>
                    {t.status === "active" ? "نشط" : "موقوف"}
                  </Badge>
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <TeacherDialog teacher={t} />
                    <form action={toggleTeacherStatus.bind(null, t.id)}>
                      <Button variant="outline" size="sm">
                        {t.status === "active" ? "إيقاف" : "تفعيل"}
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
