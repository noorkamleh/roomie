import {
  ShoppingBasket,
  Zap,
  House,
  Utensils,
  ReceiptText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
interface CategoryAppearance {
  icon: LucideIcon;
  tone: "purple" | "blue" | "mint" | "peach";
}
const categoryAppearance: Record<string, CategoryAppearance> = {
  Groceries: { icon: ShoppingBasket, tone: "mint" },
  Bills: { icon: Zap, tone: "blue" },
  Household: { icon: House, tone: "purple" },
  Food: { icon: Utensils, tone: "peach" },
};
export function getCategoryAppearance(category: string): CategoryAppearance {
  return categoryAppearance[category] ?? { icon: ReceiptText, tone: "purple" };
}
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
export function formatExpenseDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export function formatExpenseAmount(amount: number) {
  return amountFormatter.format(amount);
}
