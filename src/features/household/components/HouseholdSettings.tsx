import { useState } from "react";
import { useHousehold } from "../hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import Field from "../../../shared/components/Field";
function HouseholdSettings() {
  const { state, commit } = useHousehold();
  const [name, setName] = useState(state.name);
  const [currentUser, setCurrentUser] = useState(state.currentUser);
  const [saved, setSaved] = useState(false);
  const { error, perform } = useAction();
  return (
    <form
      className="panel space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(
          perform(() =>
            commit({
              type: "household.settings",
              name: name.trim(),
              currentUser,
            }),
          ),
        );
      }}
    >
      <h2 className="font-semibold">Household settings</h2>
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <Field label="Household name">
          <input
            required
            maxLength={200}
            value={name}
            onChange={(event) => {
              setSaved(false);
              setName(event.target.value);
            }}
          />
        </Field>
        <Field label="View as">
          <select
            value={currentUser}
            onChange={(event) => {
              setSaved(false);
              setCurrentUser(event.target.value);
            }}
          >
            {state.members.map((member) => (
              <option key={member.id}>{member.name}</option>
            ))}
          </select>
        </Field>
        <button className="secondary-button" type="submit">
          Save
        </button>
      </div>
      <p className="text-xs text-[#8A809E]">
        View as selects whose balance appears on the dashboard.
      </p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-[#268466]">
          Settings saved.
        </p>
      )}
    </form>
  );
}
export default HouseholdSettings;
