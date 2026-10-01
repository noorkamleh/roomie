import { Search, X } from "lucide-react";
interface ExpenseToolbarProps {
  query: string;
  count: number;
  onQueryChange: (query: string) => void;
}
function ExpenseToolbar({ query, count, onQueryChange }: ExpenseToolbarProps) {
  return (
    <div className="expense-toolbar">
      <div>
        <div className="expense-toolbar-heading">
          <h2 id="expense-history-heading">Expense history</h2>
          <span aria-live="polite">
            {count} {count === 1 ? "expense" : "expenses"}
          </span>
        </div>
        <p>Shared spending, with the details that matter.</p>
      </div>
      <div className="expense-search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          aria-label="Search expenses"
          placeholder="Search expenses or people..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear expense search"
            onClick={() => onQueryChange("")}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
export default ExpenseToolbar;
