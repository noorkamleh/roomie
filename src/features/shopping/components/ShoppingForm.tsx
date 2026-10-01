import { useState } from "react";
import { Plus } from "lucide-react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import Field from "../../../shared/components/Field";
function ShoppingForm() {
  const { commit } = useHousehold();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const { error, perform } = useAction();
  return (
    <form
      className="panel"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          perform(() =>
            commit({
              type: "shopping.add",
              item: {
                id: crypto.randomUUID(),
                name: name.trim(),
                quantity: Number(quantity),
                completed: false,
              },
            }),
          )
        ) {
          setName("");
          setQuantity("1");
        }
      }}
    >
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_110px_auto]">
        <Field label="Shopping item">
          <input
            required
            maxLength={200}
            placeholder="Milk, bread, cleaning supplies..."
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Quantity">
          <input
            required
            type="number"
            min="1"
            max="9999"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </Field>
        <button className="primary-button" type="submit">
          <Plus size={18} />
          Add item
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
export default ShoppingForm;
