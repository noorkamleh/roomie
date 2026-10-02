import { Plus } from "lucide-react";
import Field from "../../../shared/components/Field";
import { useAddMember } from "../hooks/useAddMember";
function AddMemberForm() {
  const { name, setName, error, add } = useAddMember();
  return (
    <form
      className="panel"
      onSubmit={(event) => {
        event.preventDefault();
        add();
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
