import { ArrowDownLeft, ArrowUpRight, CircleCheck } from "lucide-react";

export const memberTones = ["purple", "mint", "rose"] as const;
export type MemberTone = (typeof memberTones)[number];

export function balanceAppearance(balance: number) {
  if (balance > 0)
    return {
      status: "receivable",
      label: "To receive",
      description: "Receivable from the household",
      icon: ArrowDownLeft,
    } as const;
  if (balance < 0)
    return {
      status: "owed",
      label: "To pay",
      description: "Owed to the household",
      icon: ArrowUpRight,
    } as const;
  return {
    status: "settled",
    label: "Settled",
    description: "All settled",
    icon: CircleCheck,
  } as const;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
export function formatRepaymentDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}
