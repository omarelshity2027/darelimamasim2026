export const CURRENCY = "ج.م";

type MoneyLike = number | string | { toNumber(): number };

export function toNumber(value: MoneyLike): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function formatMoney(value: MoneyLike): string {
  const n = toNumber(value);
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${CURRENCY}`;
}

export function formatDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateInput(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function monthLabel(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString("ar-EG", { month: "long", year: "numeric" });
}
