import { Search, X, LayoutGrid, List } from "lucide-react";
import { expenseMonthLabel } from "../utils/filterExpenses";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
interface ExpenseToolbarProps {
  query: string;
  count: number;
  onQueryChange: (query: string) => void;
  month: string;
  category: string;
  payer: string;
  months: string[];
  categories: string[];
  payers: string[];
  view: "cards" | "list";
  onMonthChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPayerChange: (value: string) => void;
  onViewChange: (value: "cards" | "list") => void;
}
function ExpenseToolbar({
  query,
  count,
  onQueryChange,
  month,
  category,
  payer,
  months,
  categories,
  payers,
  view,
  onMonthChange,
  onCategoryChange,
  onPayerChange,
  onViewChange,
}: ExpenseToolbarProps) {
  const { t, locale } = usePreferences();
  return (
    <div className="expense-toolbar">
      <div>
        <div className="expense-toolbar-heading">
          <h2 id="expense-history-heading">{t("Expense history")}</h2>
          <span aria-live="polite">
            {t(count === 1 ? "{count} expense" : "{count} expenses", { count })}
          </span>
        </div>
        <p>{t("Shared spending, with the details that matter.")}</p>
      </div>
      <div
        className="expense-view-toggle"
        role="group"
        aria-label={t("Expense view")}
      >
        <button
          type="button"
          aria-pressed={view === "cards"}
          onClick={() => onViewChange("cards")}
        >
          <LayoutGrid size={15} aria-hidden="true" />
          {t("Cards")}
        </button>
        <button
          type="button"
          aria-pressed={view === "list"}
          onClick={() => onViewChange("list")}
        >
          <List size={15} aria-hidden="true" />
          {t("List")}
        </button>
      </div>
      <div className="expense-search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          aria-label={t("Search expenses")}
          placeholder={t("Search expenses or people...")}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && (
          <button
            type="button"
            aria-label={t("Clear expense search")}
            onClick={() => onQueryChange("")}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="expense-filter-fields">
        <label>
          {t("Month")}
          <select
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            aria-label={t("Expense month")}
          >
            <option value="">{t("All time")}</option>
            {months.map((value) => (
              <option key={value} value={value}>
                {expenseMonthLabel(value, locale)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Category")}
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label={t("Expense category")}
          >
            <option value="">{t("All categories")}</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {t(value)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Paid by")}
          <select
            value={payer}
            onChange={(event) => onPayerChange(event.target.value)}
            aria-label={t("Expense payer")}
          >
            <option value="">{t("All payers")}</option>
            {payers.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
export default ExpenseToolbar;
