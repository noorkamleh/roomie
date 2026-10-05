import { useState } from "react";
import type { Bill } from "../../../shared/types";
import { useAddDialog } from "../../../shared/hooks/useAddDialog";
import { useToday } from "../../../shared/hooks/useToday";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import {
  billStatus,
  prioritizeBills,
  countBillStatuses,
} from "../utils/status";
import type { BillStatus } from "../utils/status";

export type BillFilter = "all" | BillStatus;

export function useBillList() {
  const { state } = useHousehold();
  const today = useToday();
  const { isOpen: adding, open: openAdd, close: closeAdd } = useAddDialog();
  const [paying, setPaying] = useState<Bill | null>(null);
  const [filter, setFilter] = useState<BillFilter>("all");
  const entries = prioritizeBills(state.bills, today).filter(
    (bill) => filter === "all" || billStatus(bill, today) === filter,
  );

  return {
    counts: countBillStatuses(state.bills, today),
    entries,
    expenses: state.expenses,
    today,
    filter,
    setFilter,
    adding,
    openAdd,
    closeAdd,
    paying,
    openPayment: setPaying,
    closePayment: () => setPaying(null),
  };
}
