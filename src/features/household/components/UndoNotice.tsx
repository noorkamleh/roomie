import { Undo2 } from "lucide-react";
import { useHousehold } from "../hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function UndoNotice() {
  const { t } = usePreferences();
  const { lastAction, undo } = useHousehold();
  const { error, perform } = useAction();
  if (!lastAction && !error) return null;
  return (
    <aside className="undo-notice" aria-label={t("Last action")}>
      {lastAction && <p role="status">{t(lastAction)}</p>}
      {lastAction && (
        <button type="button" onClick={() => perform(undo)}>
          <Undo2 size={16} aria-hidden="true" />
          {t("Undo")}
        </button>
      )}
      {error && <p role="alert">{error}</p>}
    </aside>
  );
}
export default UndoNotice;
