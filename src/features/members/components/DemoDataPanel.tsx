import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { useDemoData } from "../hooks/useDemoData";

function DemoDataPanel() {
  const { t } = usePreferences();
  const { error, loadDemo } = useDemoData();
  return (
    <section
      className="members-panel members-demo"
      aria-labelledby="demo-data-heading"
    >
      <div>
        <h2 id="demo-data-heading">{t("Explore a demo household")}</h2>
        <p>
          {t(
            "Try varied expenses, recurring bills, rotating tasks, shopping units and a monthly budget. This replaces your current household; Undo restores it immediately.",
          )}
        </p>
      </div>
      <button type="button" className="secondary-button" onClick={loadDemo}>
        {t("Load demo data")}
      </button>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </section>
  );
}
export default DemoDataPanel;
