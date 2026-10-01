import { Plus } from "lucide-react";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import PageHeader from "../../../shared/components/PageHeader";
import Modal from "../../../shared/components/Modal";
import EmptyState from "../../../shared/components/EmptyState";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseCard from "../components/ExpenseCard";
import { useExpenseList } from "../hooks/useExpenseList";

function Expenses() {
  const {
    entries,
    total,
    query,
    setQuery,
    error,
    editing,
    isDialogOpen,
    openNew,
    openEdit,
    closeDialog,
    removeExpense,
    isBillExpense,
  } = useExpenseList();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track what was paid, who paid it, and everyone's share."
        action={
          <button className="primary-button" onClick={openNew}>
            <Plus size={18} />
            Add expense
          </button>
        }
      />
      <div className="panel flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">All recorded expenses</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(total)}</p>
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
        {entries.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            linked={isBillExpense(expense)}
            onEdit={openEdit}
            onDelete={removeExpense}
          />
        ))}
      </div>
      {entries.length === 0 && (
        <EmptyState message="No expenses match. Add an expense to get started." />
      )}
      {isDialogOpen && (
        <Modal
          title={editing ? "Edit expense" : "Add expense"}
          onClose={closeDialog}
        >
          <ExpenseForm expense={editing ?? undefined} onSaved={closeDialog} />
        </Modal>
      )}
    </div>
  );
}
export default Expenses;
