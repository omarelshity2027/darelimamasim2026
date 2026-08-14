# PROJECT_MAP — دار الإمام عاصم

نظام إدارة لحلقة تحفيظ القرآن الكريم (الطلاب، المعلمون، الحسابات والتقارير).

## [TECH_STACK]

- **Framework:** Next.js 16.3.1 (App Router, Turbopack, RTL `dir="rtl"`, خط Cairo)
- **UI:** React 19.2.8, Tailwind CSS 4.3.3, shadcn/ui (radix-nova، مكونات: button, card, input, label, table, badge, select, dialog, sonner)
- **Language/Quality:** TypeScript 5.9.3، ESLint (react-hooks)، tsc --noEmit
- **DB/ORM:** Prisma 7.9.1 (+ `@prisma/adapter-pg`)، PostgreSQL 18.4 (embedded-postgres للديف، منفذ 5433)
- **Auth:** jose (HS256 JWT في كوكي httpOnly `session`، مدة 7 أيام)، بوابة `src/proxy.ts`
- **Validation:** zod 4.4.3 — **Charts:** recharts 3.10.1 — **Toasts:** sonner 2.0.8 — **Icons:** lucide-react 1.31.0
- **Scripts:** db-start/db-stop/check-db (embedded-postgres)، prisma migrate/seed/studio

## [SYSTEM_FLOW]

1. `src/proxy.ts` يحمي كل المسارات عدا `/login` (يعيد التوجيه لـ `/login` بدون جلسة).
2. `login` (server action) يتحقق من `AUTH_USERNAME`/`AUTH_PASSWORD` ويصدر كوكي الجلسة عبر jose.
3. `src/lib/dal.ts` (getSession/requireAuth) يتحقق من الكوكي في كل صفحة.
4. صفحات العرض (Server Components) تجلب البيانات عبر `src/lib/queries.ts`؛ الإجراءات الكتابية عبر `src/lib/actions/*`.
5. الحوارات (Client Components) تستدعي السيرفر أكشن مباشرة في `onSubmit` وتظهر النتيجة عبر sonner، ثم تُعيد التوجيه/التحديث بـ `revalidatePath`.
6. الحركات المالية تُربط بفئات وأنواع (INCOME/EXPENSE) وبطلاب/معلمين اختيارياً.
7. تقارير المتأخرات = `المستحق (رسم شهري × شهور منذ الالتحاق) − المدفوع (إيرادات مرتبطة بالطالب)`.

## [ARCHITECTURE]

```
src/
  proxy.ts                      # بوابة المصادقة
  lib/
    db.ts logger.ts session.ts  # Prisma adapter، سجل غير متزامن، JWT
    dal.ts                      # جلسة واشتراط دخول
    validators.ts format.ts     # zod schemas + تنسيق أرقام/تواريخ (ج.م)
    queries.ts                  # overview، monthly series، categories، balances، transactions، months
    actions/                    # auth، students، teachers، finance
  app/
    (auth)/login/page.tsx       # نموذج الدخول
    (dashboard)/layout.tsx      # القائمة الجانبية + خروج
    dashboard/ students/ teachers/ finance/ reports/
  components/
    layout/ auth/ dashboard/ students/ teachers/ finance/ reports/
prisma/
  schema.prisma                 # Student، Teacher، Category، Transaction
  seed.ts                       # 7 فئات مالية
  config.ts                     # إعداد Prisma 7 + أمر seed
scripts/
  db-start.mjs db-stop.mjs check-db.mjs
```

## [ORPHANS & PENDING]

- لا يوجد كود يتيم أو مهام معلقة. جميع المراحل (M0–M6) مكتملة والتحقق أخضر: `tsc --noEmit` ✓، `npm run lint` ✓، `npm run build` ✓، اختبار دخول/صفحات (HTTP 200/307) ✓.

## [DEPLOYMENT CHECKLIST] (للتشغيل على السحابة)

- استبدل `DATABASE_URL` بعنوان PostgreSQL سحابي (Vercel Postgres / Railway / Neon) ثم `prisma migrate deploy` + `prisma db seed`.
- غيّر `AUTH_PASSWORD` و `SESSION_SECRET` (قيم مؤقتة حالياً في `.env`).
- انشر على Vercel/Railway.
