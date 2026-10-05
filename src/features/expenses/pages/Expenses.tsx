import "../styles/expenses.css";
import ExpensesHeader from "../components/ExpensesHeader";
import ExpensesOverview from "../components/ExpensesOverview";
import ExpenseToolbar from "../components/ExpenseToolbar";
import Modal from "../../../shared/components/Modal";
import EmptyState from "../../../shared/components/EmptyState";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseCard from "../components/ExpenseCard";
import ExpenseSplitDetails from "../components/ExpenseSplitDetails";
import ExpenseListRow from "../components/ExpenseListRow";
import MonthlyBudgets from "../components/MonthlyBudgets";
import { useExpenseList } from "../hooks/useExpenseList";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function Expenses() {
  const { t } = usePreferences();
  const {
    entries,
    currentUser,
    members,
    total,
    periodLabel,
    includesFuture,
    filtered,
    month,
    setMonth,
    category,
    setCategory,
    payer,
    setPayer,
    view,
    setView,
    months,
    categories,
    payers,
    query,
    setQuery,
    error,
    editing,
    detailExpense,
    closeDetails,
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
      <ExpensesOverview
        total={total}
        periodLabel={periodLabel}
        includesFuture={includesFuture}
        filtered={filtered}
      />
      <MonthlyBudgets reportMonth={month} />
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
          month={month}
          category={category}
          payer={payer}
          months={months}
          categories={categories}
          payers={payers}
          view={view}
          onMonthChange={setMonth}
          onCategoryChange={setCategory}
          onPayerChange={setPayer}
          onViewChange={setView}
        />
        {view === "cards" ? (
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
        ) : (
          <ul className="expense-list" aria-label={t("Expense list")}>
            {entries.map((expense) => (
              <ExpenseListRow
                key={expense.id}
                expense={expense}
                currentUser={currentUser}
                members={members}
                linked={isBillExpense(expense)}
                onEdit={openEdit}
                onDelete={removeExpense}
              />
            ))}
          </ul>
        )}
        {entries.length === 0 && (
          <EmptyState
            message={t("No expenses match. Add an expense to get started.")}
          />
        )}
      </section>
      {detailExpense && (
        <Modal title={t("Expense details")} onClose={closeDetails}>
          <h3 className="expense-detail-title">{detailExpense.title}</h3>
          <ExpenseSplitDetails
            expense={detailExpense}
            currentUser={currentUser}
          />
        </Modal>
      )}
      {isDialogOpen && (
        <Modal
          title={editing ? t("Edit expense") : t("Add expense")}
          onClose={closeDialog}
        >
          <ExpenseForm expense={editing ?? undefined} onSaved={closeDialog} />
        </Modal>
      )}
    </div>
  );
}
export default Expenses;
