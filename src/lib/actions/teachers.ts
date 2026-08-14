"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/dal";
import { teacherSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

export type ActionState = { error?: string; success?: string };

function numOrZero(value: FormDataEntryValue | null): number {
  const s = String(value ?? "").trim();
  return s === "" ? 0 : Number(s);
}

function fromForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    salary: numOrZero(formData.get("salary")),
    joinDate: String(formData.get("joinDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export async function createTeacher(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  const parsed = teacherSchema.safeParse(fromForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;
  try {
    await db.teacher.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        salary: data.salary,
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
        notes: data.notes || null,
      },
    });
  } catch (err) {
    logger.error("teacher create failed", { err: String(err) });
    return { error: "تعذر حفظ المعلم، حاول مجدداً" };
  }
  logger.info("teacher created", { name: data.name });
  revalidatePath("/teachers");
  return { success: "تمت إضافة المعلم بنجاح" };
}

export async function updateTeacher(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  const id = Number(formData.get("id"));
  const parsed = teacherSchema.safeParse(fromForm(formData));
  if (!Number.isInteger(id) || id <= 0) return { error: "معرّف غير صالح" };
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;
  try {
    await db.teacher.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        salary: data.salary,
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
        notes: data.notes || null,
      },
    });
  } catch (err) {
    logger.error("teacher update failed", { id, err: String(err) });
    return { error: "تعذر تحديث المعلم، حاول مجدداً" };
  }
  logger.info("teacher updated", { id });
  revalidatePath("/teachers");
  return { success: "تم تحديث بيانات المعلم" };
}

export async function toggleTeacherStatus(id: number): Promise<void> {
  await requireAuth();
  try {
    const teacher = await db.teacher.findUnique({ where: { id } });
    if (!teacher) return;
    await db.teacher.update({
      where: { id },
      data: { status: teacher.status === "active" ? "inactive" : "active" },
    });
    logger.info("teacher status toggled", { id, status: teacher.status });
  } catch (err) {
    logger.error("teacher status toggle failed", { id, err: String(err) });
  }
  revalidatePath("/teachers");
}
