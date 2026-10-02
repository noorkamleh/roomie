import { ArrowRight } from "lucide-react";
import { useHousehold } from "../hooks/HouseholdContext";
import { suggestSettlements } from "../../expenses/utils/calculations";
import { useAction } from "../../../shared/hooks/useAction";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { localDate } from "../../../shared/utils/dates";
function BalanceTransfers() {
  const { state, commit } = useHousehold();
  const { error, perform } = useAction();
  const transfers = suggestSettlements(
    state.expenses,
    state.members.map((member) => member.name),
    state.settlements,
  );
  return (
    <section className="panel">
      <h2 className="text-lg font-semibold">Who pays whom?</h2>
      <p className="mt-1 text-sm text-[#8A809E]">
        Suggested transfers settle the household's net balances.
      </p>
      <div className="mt-5 space-y-3">
        {transfers.map((transfer) => (
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--roomie-card-border)] bg-[#F9F6FF] p-4"
            key={`${transfer.from}-${transfer.to}`}
          >
            <p className="flex items-center gap-2 text-sm">
              <span>{transfer.from}</span>
              <ArrowRight size={16} className="text-[#9F7FD0]" />
              <span>{transfer.to}</span>
              <strong className="ml-2">
                {formatCurrency(transfer.amount)}
              </strong>
            </p>
            <button
              className="secondary-button"
              onClick={() => {
                if (
                  window.confirm(
                    `Record that ${transfer.from} has paid ${transfer.to} ${formatCurrency(transfer.amount)}?`,
                  )
                )
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
              }}
            >
              Record repayment
            </button>
          </div>
        ))}
        {transfers.length === 0 && (
          <p className="text-sm text-[#288469]">All balances are settled.</p>
        )}
      </div>
      {error && (
        <p role="alert" className="form-error mt-3">
          {error}
        </p>
      )}
      {state.settlements.length > 0 && (
        <div className="mt-6 border-t border-[#EFE9F8] pt-4">
          <h3 className="mb-3 text-sm font-semibold">Repayment history</h3>
          {[...state.settlements].reverse().map((payment) => (
            <p key={payment.id} className="mb-2 text-xs text-[#8A809E]">
              {payment.from} paid {payment.to} {formatCurrency(payment.amount)}{" "}
              on {payment.date}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
export default BalanceTransfers;
