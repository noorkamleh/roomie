import "../styles/expenses.css";
import ExpensesHeader from "../components/ExpensesHeader";
import ExpensesOverview from "../components/ExpensesOverview";
import ExpenseToolbar from "../components/ExpenseToolbar";
import Modal from "../../../shared/components/Modal";
import EmptyState from "../../../shared/components/EmptyState";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseCard from "../components/ExpenseCard";
import { useExpenseList } from "../hooks/useExpenseList";

function Expenses() {
  const {
    entries,
    currentUser,
    members,
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
    <div className="expenses-page">
      <ExpensesHeader onAdd={openNew} />
      <ExpensesOverview total={total} />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <section
        className="expense-ledger"
        aria-labelledby="expense-history-heading"
      >
        <ExpenseToolbar
          query={query}
          count={entries.length}
          onQueryChange={setQuery}
        />
        <div className="expense-card-grid">
          {entries.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              currentUser={currentUser}
              members={members}
              linked={isBillExpense(expense)}
              onEdit={openEdit}
              onDelete={removeExpense}
            />
          ))}
        </div>
        {entries.length === 0 && (
          <EmptyState message="No expenses match. Add an expense to get started." />
        )}
      </section>
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
