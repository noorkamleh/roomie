import UpcomingBills from "./UpcomingBills";
import AttentionChores from "./AttentionChores";
import OutstandingRepayments from "./OutstandingRepayments";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function NeedsAttention() {
  const { t } = usePreferences();
  return (
    <section
      aria-labelledby="attention-heading"
      className="dashboard-panel dashboard-attention"
    >
      <div className="dashboard-panel-heading">
        <div>
          <p className="dashboard-eyebrow">{t("Take the next step")}</p>
          <h2 id="attention-heading">{t("Needs your attention")}</h2>
        </div>
      </div>
      <UpcomingBills />
      <AttentionChores />
      <OutstandingRepayments />
    </section>
  );
}

export default NeedsAttention;
