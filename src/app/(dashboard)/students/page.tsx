import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/dal";
import { toggleStudentStatus } from "@/lib/actions/students";
import { formatMoney, formatDate } from "@/lib/format";
import { toNumber } from "@/lib/format";
import { StudentDialog, type StudentDTO, type TeacherOption } from "@/components/students/student-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "الطلاب" };

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAuth();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const [teachers, students] = await Promise.all([
    db.teacher.findMany({
      where: { status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.student.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { guardianName: { contains: query, mode: "insensitive" } },
              { guardianPhone: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: { teacher: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const teacherOptions: TeacherOption[] = teachers.map((t) => ({
    id: t.id,
    name: t.name,
  }));

  const rows: Array<StudentDTO & { teacherName: string | null }> = students.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    guardianName: s.guardianName,
    guardianPhone: s.guardianPhone,
    teacherId: s.teacherId,
    teacherName: s.teacher?.name ?? null,
    monthlyFee: toNumber(s.monthlyFee),
    joinDate: s.joinDate.toISOString(),
    notes: s.notes,
    status: s.status,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">الطلاب</h1>
          <p className="text-sm text-muted-foreground">
            إدارة طلاب الدار — {rows.length} طالب
          </p>
        </div>
        <StudentDialog teachers={teacherOptions} />
      </div>

      <form method="get" action="/students" className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="ابحث بالاسم أو الهاتف أو ولي الأمر..."
            className="pr-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          بحث
        </Button>
      </form>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>ولي الأمر</TableHead>
              <TableHead>المعلم</TableHead>
              <TableHead>المصروف الشهري</TableHead>
              <TableHead>تاريخ الالتحاق</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  لا يوجد طلاب
                </TableCell>
              </TableRow>
            )}
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell dir="ltr" className="text-left">{s.phone ?? "—"}</TableCell>
                <TableCell>{s.guardianName ?? "—"}</TableCell>
                <TableCell>{s.teacherName ?? "—"}</TableCell>
                <TableCell>{formatMoney(s.monthlyFee)}</TableCell>
                <TableCell>{formatDate(s.joinDate)}</TableCell>
                <TableCell>
                  <Badge variant={s.status === "active" ? "default" : "secondary"}>
                    {s.status === "active" ? "نشط" : "موقوف"}
                  </Badge>
                </TableCell>
                <TableCell className="text-left">
                  <div className="flex items-center gap-1">
                    <StudentDialog student={s} teachers={teacherOptions} />
                    <form action={toggleStudentStatus.bind(null, s.id)}>
                      <Button variant="outline" size="sm">
                        {s.status === "active" ? "إيقاف" : "تفعيل"}
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
