import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useState } from "react";
import { suggestedRepayments } from "../utils/repayments";
import { useAction } from "../../../shared/hooks/useAction";
import { localDate } from "../../../shared/utils/dates";
import type { Settlement } from "../../../shared/types";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { useConfirmation } from "../../../shared/confirmation/ConfirmationContext";

export function useBalanceTransfers() {
  const { state, commit } = useHousehold();
  const { formatCurrency } = usePreferences();
  const confirm = useConfirmation();
  const { error, perform } = useAction();
  const [paying, setPaying] = useState<Omit<Settlement, "id" | "date"> | null>(
    null,
  );
  const transfers = suggestedRepayments(state);
  async function record(transfer: Omit<Settlement, "id" | "date">) {
    if (
      await confirm({
        title: "Record repayment",
        message: "Record that {from} has paid {to} {amount}?",
        params: {
          from: transfer.from,
          to: transfer.to,
          amount: formatCurrency(transfer.amount),
        },
        confirmLabel: "Record repayment",
      })
    ) {
      perform(() =>
        commit({
          type: "settlement.add",
          settlement: {
            ...transfer,
            id: crypto.randomUUID(),
            date: localDate(),
          },
        }),
      );
    }
  }
  return {
    transfers,
    settlements: state.settlements,
    error,
    record,
    paying,
    openPayment: (transfer?: Omit<Settlement, "id" | "date">) =>
      setPaying(
        transfer ??
          transfers[0] ?? {
            from: state.currentUser,
            to:
              state.members.find((member) => member.name !== state.currentUser)
                ?.name ?? state.currentUser,
            amount: 0,
          },
      ),
    closePayment: () => setPaying(null),
    simplifyDebts: state.simplifyDebts !== false,
    changeDebtMode: (enabled: boolean) =>
      perform(() => commit({ type: "household.debtMode", enabled })),
  };
}
