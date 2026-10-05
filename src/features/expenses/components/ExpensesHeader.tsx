import { Plus, ReceiptText } from "lucide-react";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
function ExpensesHeader({ onAdd }: { onAdd: () => void }) {
  const { t } = usePreferences();
  return (
    <header className="expense-page-header">
      <div>
        <p className="expense-eyebrow">
          <ReceiptText size={14} aria-hidden="true" />
          {t("Household finances")}
        </p>
        <h1>{t("Expenses")}</h1>
        <p className="expense-page-description">
          {t("Track what was paid, who paid it, and everyone's share.")}
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
        {t("Add expense")}
      </button>
    </header>
  );
}
export default ExpensesHeader;
