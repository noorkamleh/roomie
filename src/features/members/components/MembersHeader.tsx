import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { House, UsersRound } from "lucide-react";
function MembersHeader({
  householdName,
  count,
}: {
  householdName: string;
  count: number;
}) {
  const { t } = usePreferences();
  return (
    <header className="members-page-header">
      <div>
        <p className="members-eyebrow">
          <UsersRound size={14} aria-hidden="true" />
          {t("Your household")}
        </p>
        <h1>{t("Household members")}</h1>
        <p className="members-page-description">
          {t("Shared balances, repayments and household settings.")}
        </p>
      </div>
      <div className="members-household-label">
        <span>
          <House size={18} aria-hidden="true" />
        </span>
        <div>
          <strong>{householdName}</strong>
          <p>
            {t(
              count === 1
                ? "{count} member sharing one home"
                : "{count} members sharing one home",
              { count },
            )}
          </p>
        </div>
      </div>
    </header>
  );
}
export default MembersHeader;
