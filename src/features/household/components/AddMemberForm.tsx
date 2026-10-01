import { useState } from "react";
import { Plus } from "lucide-react";
import { useHousehold } from "../hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import Field from "../../../shared/components/Field";
function AddMemberForm() {
  const { commit } = useHousehold();
  const [name, setName] = useState("");
  const { error, perform } = useAction();
  return (
    <form
      className="panel"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          perform(() =>
            commit({
              type: "member.add",
              member: {
                id: crypto.randomUUID(),
                name: name.trim(),
                avatar: "",
              },
            }),
          )
        )
          setName("");
      }}
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1">
          <Field label="New member name">
            <input
              required
              maxLength={200}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Who is joining your home?"
            />
          </Field>
        </div>
        <button className="primary-button" type="submit">
          <Plus size={18} />
          Add member
        </button>
      </div>
      {error && (
        <p role="alert" className="form-error mt-3">
          {error}
        </p>
      )}
    </form>
  );
}
export default AddMemberForm;
