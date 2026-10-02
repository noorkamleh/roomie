import { Plus } from "lucide-react";
import { useShoppingForm } from "../hooks/useShoppingForm";
import Field from "../../../shared/components/Field";
function ShoppingForm() {
  const { name, setName, quantity, setQuantity, error, addItem } =
    useShoppingForm();
  return (
    <form
      className="panel"
      onSubmit={(event) => {
        event.preventDefault();
        addItem();
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
