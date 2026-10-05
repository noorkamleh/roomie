import { useState } from "react";
import type { Bill, ExpenseSplit } from "../../../shared/types";
import { localDate } from "../../../shared/utils/dates";
import { useAction } from "../../../shared/hooks/useAction";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { splitExpense } from "../../expenses/utils/calculations";

export function useBillPayment(bill: Bill) {
  const { state, commit } = useHousehold();
  const members = state.members.filter((member) => !member.archived);
  const [paidBy, setPaidBy] = useState(state.currentUser);
  const [date, setDate] = useState(localDate);
  const [participants, setParticipants] = useState(
    members.map((member) => member.name),
  );
  const { error, perform } = useAction();
  const [split, setSplit] = useState<ExpenseSplit | undefined>();

  function confirmPayment() {
    return perform(() => {
      if (participants.length === 0)
        throw new Error("Choose at least one member to split this bill.");
      splitExpense({ amount: bill.amount, participants, split });
      commit({
        type: "bill.pay",
        id: bill.id,
        expense: {
          id: `bill-${bill.id}`,
          title: bill.title,
          amount: bill.amount,
          category: "Bills",
          paidBy,
          date,
          participants,
          split,
        },
      });
    });
  }

  return {
    members,
    paidBy,
    setPaidBy,
    date,
    setDate,
    participants,
    setParticipants,
    split,
    setSplit,
    error,
    confirmPayment,
  };
}
