import { useHousehold } from "../../household/hooks/HouseholdContext";
import { suggestSettlements } from "../../expenses/utils/calculations";
import { useAction } from "../../../shared/hooks/useAction";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { localDate } from "../../../shared/utils/dates";
import type { Settlement } from "../../../shared/types";

export function useBalanceTransfers() {
  const { state, commit } = useHousehold();
  const { error, perform } = useAction();
  const transfers = suggestSettlements(
    state.expenses,
    state.members.map((member) => member.name),
    state.settlements,
  );
  function record(transfer: Omit<Settlement, "id" | "date">) {
    if (
      window.confirm(
        `Record that ${transfer.from} has paid ${transfer.to} ${formatCurrency(transfer.amount)}?`,
      )
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
  return { transfers, settlements: state.settlements, error, record };
}
