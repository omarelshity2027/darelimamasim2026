"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { logger } from "@/lib/logger";

export type LoginState = { error?: string };

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return Buffer.compare(bufA, bufB) === 0;
}

export async function login(
  _prev: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const expectedUser = process.env.AUTH_USERNAME ?? "";
  const expectedPass = process.env.AUTH_PASSWORD ?? "";

  if (
    !expectedUser ||
    !expectedPass ||
    !safeEqual(username, expectedUser) ||
    !safeEqual(password, expectedPass)
  ) {
    logger.warn("login failed", { username });
    return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
  }

  await createSession(username);
  logger.info("login success");
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  logger.info("logout");
  redirect("/login");
}
