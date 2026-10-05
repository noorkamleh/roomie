import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { Plus } from "lucide-react";
import { useShoppingForm } from "../hooks/useShoppingForm";
import Field from "../../../shared/components/Field";
function ShoppingForm() {
  const { t } = usePreferences();
  const {
    name,
    setName,
    quantity,
    setQuantity,
    unit,
    setUnit,
    error,
    addItem,
  } = useShoppingForm();
  return (
    <form
      className="shopping-add-form"
      aria-labelledby="shopping-add-heading"
      onSubmit={(event) => {
        event.preventDefault();
        addItem();
      }}
    >
      <h2 id="shopping-add-heading">{t("Add to your list")}</h2>
      <div className="shopping-add-fields">
        <Field label={t("Shopping item")}>
          <input
            required
            maxLength={200}
            placeholder={t("Milk, bread, cleaning supplies...")}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label={t("Quantity")}>
          <input
            required
            type="text"
            inputMode="numeric"
            lang="en-US"
            dir="ltr"
            pattern="0*[1-9][0-9]{0,3}"
            title={t("Enter a whole number from 1 to 9999")}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </Field>
        <Field label={t("Unit")}>
          <select
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
          >
            <option value="">{t("Items")}</option>
            <option value="pc">{t("Pieces")}</option>
            <option value="L">{t("Liters (L)")}</option>
            <option value="mL">{t("Milliliters (mL)")}</option>
            <option value="kg">{t("Kilograms (kg)")}</option>
            <option value="g">{t("Grams (g)")}</option>
            <option value="pack">{t("Packs")}</option>
            <option value="bottle">{t("Bottles")}</option>
            <option value="box">{t("Boxes")}</option>
          </select>
        </Field>
        <button className="primary-button" type="submit">
          <Plus size={18} aria-hidden="true" />
          {t("Add item")}
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
