import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import { localDate } from "../../../shared/utils/dates";
import Field from "../../../shared/components/Field";
function ChoreForm({ onSaved }: { onSaved: () => void }) {
  const { t } = usePreferences();
  const { state, commit } = useHousehold();
  const members = state.members.filter((member) => !member.archived);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState(state.currentUser);
  const [dueDate, setDueDate] = useState(localDate);
  const [frequency, setFrequency] = useState<"none" | "weekly" | "monthly">(
    "none",
  );
  const [rotation, setRotation] = useState(
    members.map((member) => member.name),
  );
  const { error, perform } = useAction();
  return (
    <form
      className="chore-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          perform(() => {
            const id = crypto.randomUUID();
            commit({
              type: "chore.add",
              chore: {
                id,
                title: title.trim(),
                assignedTo,
                dueDate,
                status: "pending",
                ...(frequency !== "none"
                  ? {
                      seriesId: id,
                      recurrence: {
                        frequency,
                        rotation: members
                          .filter((member) => rotation.includes(member.name))
                          .map((member) => member.name),
                        ...(frequency === "monthly"
                          ? { anchorDay: Number(dueDate.slice(-2)) }
                          : {}),
                      },
                    }
                  : {}),
              },
            });
          })
        )
          onSaved();
      }}
    >
      <Field label={t("Task")}>
        <input
          required
          maxLength={200}
          placeholder={t("e.g. Clean the kitchen")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field label={t("Assigned to")}>
        <select
          value={assignedTo}
          onChange={(event) => {
            const name = event.target.value;
            setAssignedTo(name);
            setRotation((members) =>
              members.includes(name) ? members : [...members, name],
            );
          }}
        >
          {members.map((member) => (
            <option key={member.id}>{member.name}</option>
          ))}
        </select>
      </Field>
      <Field label={t("Repeat")}>
        <select
          value={frequency}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "none" || value === "weekly" || value === "monthly")
              setFrequency(value);
          }}
        >
          <option value="none">{t("Does not repeat")}</option>
          <option value="weekly">{t("Weekly")}</option>
          <option value="monthly">{t("Monthly")}</option>
        </select>
      </Field>
      {frequency !== "none" && (
        <fieldset className="chore-rotation-fields">
          <legend>{t("Rotate between")}</legend>
          <p>{t("The next occurrence goes to the next selected housemate.")}</p>
          <div>
            {members.map((member) => (
              <label key={member.id}>
                <input
                  type="checkbox"
                  checked={rotation.includes(member.name)}
                  disabled={member.name === assignedTo}
                  onChange={(event) =>
                    setRotation((members) =>
                      event.target.checked
                        ? [...members, member.name]
                        : members.filter((name) => name !== member.name),
                    )
                  }
                />
                {member.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <Field label={t("Due date")}>
        <input
          type="date"
          required
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </Field>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="primary-button w-full" type="submit">
        {t("Add chore")}
      </button>
    </form>
  );
}
export default ChoreForm;
