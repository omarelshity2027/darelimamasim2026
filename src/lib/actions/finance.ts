"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/dal";
import { transactionSchema, categorySchema } from "@/lib/validators";
import { logger } from "@/lib/logger";

export type ActionState = { error?: string; success?: string };

function numOrNull(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  return s === "" ? null : Number(s);
}

export async function createTransaction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  const type = String(formData.get("type") ?? "") as "INCOME" | "EXPENSE";
  const amount = Number(String(formData.get("amount") ?? ""));
  const categoryId = Number(formData.get("categoryId"));
  const parsed = transactionSchema.safeParse({
    type,
    amount,
    categoryId,
    date: String(formData.get("date") ?? ""),
    description: String(formData.get("description") ?? ""),
    studentId: numOrNull(formData.get("studentId")),
    teacherId: numOrNull(formData.get("teacherId")),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  const data = parsed.data;
  try {
    await db.transaction.create({
      data: {
        type: data.type,
        amount: data.amount,
        categoryId: data.categoryId,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description || null,
        studentId: data.studentId ?? null,
        teacherId: data.teacherId ?? null,
      },
    });
  } catch (err) {
    logger.error("transaction create failed", { err: String(err) });
    return { error: "تعذر حفظ الحركة المالية" };
  }
  logger.info("transaction created", { type, amount });
  revalidatePath("/finance");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
  return { success: type === "INCOME" ? "تم تسجيل الإيراد" : "تم تسجيل المصروف" };
}

export async function deleteTransaction(id: number): Promise<void> {
  await requireAuth();
  try {
    await db.transaction.delete({ where: { id } });
    logger.info("transaction deleted", { id });
  } catch (err) {
    logger.error("transaction delete failed", { id, err: String(err) });
  }
  revalidatePath("/finance");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
}

export async function createCategory(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  await requireAuth();
  const type = String(formData.get("type") ?? "") as "INCOME" | "EXPENSE";
  const parsed = categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    type,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }
  try {
    await db.category.create({
      data: { name: parsed.data.name, type: parsed.data.type },
    });
  } catch (err) {
    logger.error("category create failed", { err: String(err) });
    return { error: "تعذر إضافة الفئة (قد تكون موجودة مسبقاً)" };
  }
  logger.info("category created", { name: parsed.data.name });
  revalidatePath("/finance");
  return { success: "تمت إضافة الفئة" };
}
