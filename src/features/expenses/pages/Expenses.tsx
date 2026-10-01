import { useAddDialog } from "../../../shared/hooks/useAddDialog";
import { useState } from "react";
import { Pencil, Plus, Trash2, ReceiptText } from "lucide-react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import type { Expense } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { splitExpense, calculateTotalExpenses } from "../utils/calculations";
import { useAction } from "../../../shared/hooks/useAction";
import PageHeader from "../../../shared/components/PageHeader";
import Modal from "../../../shared/components/Modal";
import EmptyState from "../../../shared/components/EmptyState";
import ExpenseForm from "../components/ExpenseForm";

function Expenses() {
  const addDialog = useAddDialog();
  const { state, commit } = useHousehold();
  const [editing, setEditing] = useState<Expense | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const { error, perform } = useAction();
  const entries = [...state.expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((expense) =>
      `${expense.title} ${expense.paidBy} ${expense.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track what was paid, who paid it, and everyone's share."
        action={
          <button className="primary-button" onClick={() => setEditing(null)}>
            <Plus size={18} />
            Add expense
          </button>
        }
      />
      <div className="panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">All recorded expenses</p>
          <p className="mt-1 text-2xl font-bold">
            {formatCurrency(calculateTotalExpenses(state.expenses))}
          </p>
        </div>
        <input
          className="search-input"
          aria-label="Search expenses"
          placeholder="Search expenses or people..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((expense) => {
          const linked = state.bills.some(
            (bill) => expense.id === `bill-${bill.id}`,
          );
          return (
            <article key={expense.id} className="panel">
              <div className="flex items-start gap-3">
                <div className="feature-icon">
                  <ReceiptText size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{expense.title}</h2>
                  <p className="mt-1 text-xs text-[#8A809E]">
                    {expense.category} / {expense.date} / Paid by{" "}
                    {expense.paidBy}
                  </p>
                </div>
                <p className="font-bold">{formatCurrency(expense.amount)}</p>
              </div>
              <div className="mt-4 space-y-2 border-t border-[#EFE9F8] pt-4">
                {splitExpense(expense).map((share) => (
                  <p
                    key={share.member}
                    className="flex justify-between text-sm text-[#72658C]"
                  >
                    <span>{share.member}'s share</span>
                    <span>{formatCurrency(share.cents / 100)}</span>
                  </p>
                ))}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                {linked ? (
                  <span className="text-xs text-[#8A809E]">
                    Created from a paid bill
                  </span>
                ) : (
                  <>
                    <button
                      className="icon-button"
                      aria-label={`Edit ${expense.title}`}
                      onClick={() => setEditing(expense)}
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete ${expense.title}`}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete ${expense.title}? Balances will be recalculated.`,
                          )
                        )
                          perform(() =>
                            commit({ type: "expense.delete", id: expense.id }),
                          );
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {entries.length === 0 && (
        <EmptyState message="No expenses match. Add an expense to get started." />
      )}
      {(editing !== undefined || addDialog.isOpen) && (
        <Modal
          title={editing ? "Edit expense" : "Add expense"}
          onClose={() => {
            setEditing(undefined);
            addDialog.close();
          }}
        >
          <ExpenseForm
            expense={editing ?? undefined}
            onSaved={() => {
              setEditing(undefined);
              addDialog.close();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
export default Expenses;
