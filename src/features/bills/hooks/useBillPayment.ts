import { useState } from "react";
import type { Bill } from "../../../shared/types";
import { localDate } from "../../../shared/utils/dates";
import { useAction } from "../../../shared/hooks/useAction";
import { useHousehold } from "../../household/hooks/HouseholdContext";

export function useBillPayment(bill: Bill) {
  const { state, commit } = useHousehold();
  const [paidBy, setPaidBy] = useState(state.currentUser);
  const [date, setDate] = useState(localDate);
  const [participants, setParticipants] = useState(
    state.members.map((member) => member.name),
  );
  const { error, perform } = useAction();

  function confirmPayment() {
    return perform(() => {
      if (participants.length === 0)
        throw new Error("Choose at least one member to split this bill.");
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
        },
      });
    });
  }

  return {
    members: state.members,
    paidBy,
    setPaidBy,
    date,
    setDate,
    participants,
    setParticipants,
    error,
    confirmPayment,
  };
}
