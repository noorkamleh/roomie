import { ArrowDownLeft, ArrowUpRight, CircleCheck } from "lucide-react";
export { formatDate as formatRepaymentDate } from "../../../shared/utils/dates";

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
