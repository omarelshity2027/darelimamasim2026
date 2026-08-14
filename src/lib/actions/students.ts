"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/dal";
import { studentSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

export type ActionState = { error?: string; success?: string };

function numOrNull(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  return s === "" ? null : Number(s);
}

function numOrZero(value: FormDataEntryValue | null): number {
  const s = String(value ?? "").trim();
  return s === "" ? 0 : Number(s);
}

function fromForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    guardianName: String(formData.get("guardianName") ?? ""),
    guardianPhone: String(formData.get("guardianPhone") ?? ""),
    teacherId: numOrNull(formData.get("teacherId")),
    monthlyFee: numOrZero(formData.get("monthlyFee")),
    joinDate: String(formData.get("joinDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createStudent(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  const parsed = studentSchema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;
  try {
    await db.student.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        guardianName: data.guardianName || null,
        guardianPhone: data.guardianPhone || null,
        teacherId: data.teacherId ?? null,
        monthlyFee: data.monthlyFee,
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
        notes: data.notes || null,
      },
    });
  } catch (err) {
    logger.error("student create failed", { err: String(err) });
    return { error: "تعذر حفظ الطالب، حاول مجدداً" };
  }
  logger.info("student created", { name: data.name });
  revalidatePath("/students");
  return { success: "تمت إضافة الطالب بنجاح" };
}

export async function updateStudent(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  const id = Number(formData.get("id"));
  const parsed = studentSchema.safeParse(fromForm(formData));
  if (!Number.isInteger(id) || id <= 0) return { error: "معرّف غير صالح" };
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;
  try {
    await db.student.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        guardianName: data.guardianName || null,
        guardianPhone: data.guardianPhone || null,
        teacherId: data.teacherId ?? null,
        monthlyFee: data.monthlyFee,
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
        notes: data.notes || null,
      },
    });
  } catch (err) {
    logger.error("student update failed", { id, err: String(err) });
    return { error: "تعذر تحديث الطالب، حاول مجدداً" };
  }
  logger.info("student updated", { id });
  revalidatePath("/students");
  return { success: "تم تحديث بيانات الطالب" };
}

export async function toggleStudentStatus(id: number): Promise<void> {
  await requireAuth();
  try {
    const student = await db.student.findUnique({ where: { id } });
    if (!student) return;
    await db.student.update({
      where: { id },
      data: { status: student.status === "active" ? "inactive" : "active" },
    });
    logger.info("student status toggled", { id, status: student.status });
  } catch (err) {
    logger.error("student status toggle failed", { id, err: String(err) });
  }
  revalidatePath("/students");
}
