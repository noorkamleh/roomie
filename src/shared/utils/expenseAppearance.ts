import {
  ShoppingBasket,
  Zap,
  Wifi,
  Droplet,
  House,
  Utensils,
  ReceiptText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Expense, UtilityKind } from "../types";
interface CategoryAppearance {
  icon: LucideIcon;
  tone: "purple" | "blue" | "mint" | "peach";
}
const categories: Record<string, CategoryAppearance> = {
  Groceries: { icon: ShoppingBasket, tone: "mint" },
  Bills: { icon: ReceiptText, tone: "blue" },
  Household: { icon: House, tone: "purple" },
  Food: { icon: Utensils, tone: "peach" },
};
const utilities: Record<UtilityKind, LucideIcon> = {
  electricity: Zap,
  internet: Wifi,
  water: Droplet,
};
export function getExpenseAppearance(
  expense: Pick<Expense, "category" | "utilityKind">,
): CategoryAppearance {
  const category = categories[expense.category] ?? {
    icon: ReceiptText,
    tone: "purple",
  };
  return expense.category === "Bills" && expense.utilityKind
    ? { ...category, icon: utilities[expense.utilityKind] ?? ReceiptText }
    : category;
}
