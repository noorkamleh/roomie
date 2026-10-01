import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import { localDate } from "../../../shared/utils/dates";
import Field from "../../../shared/components/Field";
function ChoreForm({ onSaved }: { onSaved: () => void }) {
  const { state, commit } = useHousehold();
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState(state.currentUser);
  const [dueDate, setDueDate] = useState(localDate);
  const { error, perform } = useAction();
  return (
    <form
      className="chore-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          perform(() =>
            commit({
              type: "chore.add",
              chore: {
                id: crypto.randomUUID(),
                title: title.trim(),
                assignedTo,
                dueDate,
                status: "pending",
              },
            }),
          )
        )
          onSaved();
      }}
    >
      <Field label="Task">
        <input
          required
          maxLength={200}
          placeholder="e.g. Clean the kitchen"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field label="Assigned to">
        <select
          value={assignedTo}
          onChange={(event) => setAssignedTo(event.target.value)}
        >
          {state.members.map((member) => (
            <option key={member.id}>{member.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Due date">
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
        Add chore
      </button>
    </form>
  );
}
export default ChoreForm;
