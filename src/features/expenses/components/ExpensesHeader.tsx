import { Plus, ReceiptText } from "lucide-react";
function ExpensesHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="expense-page-header">
      <div>
        <p className="expense-eyebrow">
          <ReceiptText size={14} aria-hidden="true" />
          Household finances
        </p>
        <h1>Expenses</h1>
        <p className="expense-page-description">
          Track what was paid, who paid it, and everyone's share.
        </p>
      </div>
      <button
        type="button"
        className="primary-button expense-add-button"
        onClick={onAdd}
      >
        <span>
          <Plus size={19} />
        </span>
        Add expense
      </button>
    </header>
  );
}
export default ExpensesHeader;
