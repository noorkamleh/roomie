import { useState } from "react";
import type { Settlement } from "../../../shared/types";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import { localDate } from "../../../shared/utils/dates";
import { repaymentLimit } from "../utils/repayments";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

export function useRepaymentForm(transfer: Omit<Settlement, "id" | "date">) {
  const { state, commit } = useHousehold();
  const { currency, toDisplayAmount, toBaseAmount } = usePreferences();
  const [from, setFrom] = useState(transfer.from);
  const [to, setTo] = useState(transfer.to);
  const [amountDraft, setAmountDraft] = useState<{
    value: string;
    currency: string;
    baseAmount: number;
  } | null>(null);
  const baseAmount = amountDraft?.baseAmount ?? transfer.amount;
  const amount =
    amountDraft?.currency === currency
      ? amountDraft.value
      : amountDraft?.value === "" || (!amountDraft && transfer.amount === 0)
        ? ""
        : String(toDisplayAmount(baseAmount));
  function setAmount(value: string) {
    setAmountDraft({
      value,
      currency,
      baseAmount: toBaseAmount(Number(value)),
    });
  }
  const [date, setDate] = useState(localDate);
  const { error, perform } = useAction();
  const limit = repaymentLimit(state, from, to);
  return {
    members: state.members,
    from,
    setFrom,
    to,
    setTo,
    amount,
    baseAmount,
    setAmount,
    date,
    setDate,
    limit,
    error,
    save: () =>
      perform(() =>
        commit({
          type: "settlement.add",
          settlement: {
            id: crypto.randomUUID(),
            from,
            to,
            amount: baseAmount,
            date,
          },
        }),
      ),
  };
}
