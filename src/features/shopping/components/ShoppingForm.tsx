import { Plus } from "lucide-react";
import { useShoppingForm } from "../hooks/useShoppingForm";
import Field from "../../../shared/components/Field";
function ShoppingForm() {
  const { name, setName, quantity, setQuantity, error, addItem } =
    useShoppingForm();
  return (
    <form
      className="shopping-add-form"
      aria-labelledby="shopping-add-heading"
      onSubmit={(event) => {
        event.preventDefault();
        addItem();
      }}
    >
      <h2 id="shopping-add-heading">Add to your list</h2>
      <div className="shopping-add-fields">
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
          <Plus size={18} aria-hidden="true" />
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
