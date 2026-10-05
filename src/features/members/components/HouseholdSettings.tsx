import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { Check, House, Save } from "lucide-react";
import Field from "../../../shared/components/Field";
import { useHouseholdSettings } from "../hooks/useHouseholdSettings";
function HouseholdSettings() {
  const { t } = usePreferences();
  const {
    name,
    currentUser,
    members,
    saved,
    error,
    save,
    changeName,
    changeUser,
  } = useHouseholdSettings();
  return (
    <form
      className="members-panel members-settings"
      aria-labelledby="household-settings-heading"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="members-section-heading">
        <span className="members-section-icon">
          <House size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 id="household-settings-heading">{t("Household settings")}</h2>
          <p>{t("Make this space yours.")}</p>
        </div>
      </div>
      <div className="members-form-fields">
        <Field label={t("Household name")}>
          <input
            required
            maxLength={200}
            value={name}
            onChange={(event) => changeName(event.target.value)}
          />
        </Field>
        <Field label={t("View as")}>
          <select
            value={currentUser}
            onChange={(event) => changeUser(event.target.value)}
          >
            {members.map((member) => (
              <option key={member.id}>{member.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <p className="members-field-hint">
        {t("Choose whose balance and chores you see.")}
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="members-settings-footer">
        <button className="secondary-button members-save-button" type="submit">
          <Save size={15} aria-hidden="true" />
          {t("Save")}
        </button>
        {saved && (
          <p role="status" className="members-save-status">
            <Check size={14} aria-hidden="true" />
            {t("Settings saved.")}
          </p>
        )}
      </div>
    </form>
  );
}
export default HouseholdSettings;
