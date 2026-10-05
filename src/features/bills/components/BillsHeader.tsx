import { CalendarDays, Plus } from "lucide-react";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function BillsHeader({ onAdd }: { onAdd: () => void }) {
  const { t } = usePreferences();
  return (
    <header className="bills-page-header">
      <div>
        <p className="bills-eyebrow">
          <CalendarDays size={14} aria-hidden="true" />
          {t("Household finances")}
        </p>
        <h1>{t("Bills")}</h1>
        <p className="bills-page-description">
          {t(
            "Stay ahead of due dates. Record a payment to update expenses and balances.",
          )}
        </p>
      </div>
      <button
        type="button"
        className="primary-button bills-add-button"
        onClick={onAdd}
      >
        <span>
          <Plus size={19} aria-hidden="true" />
        </span>
        {t("Add bill")}
      </button>
    </header>
  );
}
export default BillsHeader;
