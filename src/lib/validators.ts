import { z } from "zod";

const optionalString = z.string().trim().max(255).optional();
const optionalText = z.string().trim().max(1000).optional();

export const studentSchema = z.object({
  name: z.string().trim().min(2, "اسم الطالب مطلوب").max(100),
  phone: optionalString,
  guardianName: optionalString,
  guardianPhone: optionalString,
  teacherId: z.number().int().positive().nullable().optional(),
  monthlyFee: z.number().min(0, "المصروف لا يمكن أن يكون سالباً").max(10_000_000),
  joinDate: z.string().trim().optional(),
  notes: optionalText,
});

export const teacherSchema = z.object({
  name: z.string().trim().min(2, "اسم المعلم مطلوب").max(100),
  phone: optionalString,
  salary: z.number().min(0, "الراتب لا يمكن أن يكون سالباً").max(10_000_000),
  joinDate: z.string().trim().optional(),
  notes: optionalText,
});

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().min(0.01, "المبلغ مطلوب").max(10_000_000),
  categoryId: z.number().int().positive("الفئة مطلوبة"),
  date: z.string().trim().optional(),
  description: optionalText,
  studentId: z.number().int().positive().nullable().optional(),
  teacherId: z.number().int().positive().nullable().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "اسم الفئة مطلوب").max(50),
  type: z.enum(["INCOME", "EXPENSE"]),
});

export type StudentInput = z.infer<typeof studentSchema>;
export type TeacherInput = z.infer<typeof teacherSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
