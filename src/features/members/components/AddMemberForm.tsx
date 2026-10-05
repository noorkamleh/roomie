import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { Plus, UserPlus } from "lucide-react";
import Field from "../../../shared/components/Field";
import { useAddMember } from "../hooks/useAddMember";
function AddMemberForm() {
  const { t } = usePreferences();
  const { name, setName, error, add } = useAddMember();
  return (
    <form
      className="members-panel members-add-form"
      aria-labelledby="add-member-heading"
      onSubmit={(event) => {
        event.preventDefault();
        add();
      }}
    >
      <div className="members-section-heading">
        <span className="members-section-icon members-section-icon--mint">
          <UserPlus size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 id="add-member-heading">{t("Add a housemate")}</h2>
          <p>{t("Keep everyone in the loop.")}</p>
        </div>
      </div>
      <Field label={t("New member name")}>
        <input
          required
          maxLength={200}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t("Who is joining your home?")}
        />
      </Field>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="primary-button members-add-button" type="submit">
        <Plus size={17} aria-hidden="true" />
        {t("Add member")}
      </button>
    </form>
  );
}
export default AddMemberForm;
