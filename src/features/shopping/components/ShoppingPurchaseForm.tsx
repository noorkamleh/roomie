import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import Field from "../../../shared/components/Field";
import ExpenseSplitFields from "../../expenses/components/ExpenseSplitFields";
import { useShoppingPurchase } from "../hooks/useShoppingPurchase";
import { formatShoppingQuantity } from "../utils/quantity";
import { maxDisplayInputAmount } from "../../expenses/utils/currencyAmounts";

function ShoppingPurchaseForm({ onSaved }: { onSaved: () => void }) {
  const { t, currency } = usePreferences();
  const {
    items,
    itemIds,
    toggleItem,
    title,
    setTitle,
    amount,
    baseAmount,
    setAmount,
    paidBy,
    setPaidBy,
    date,
    setDate,
    participants,
    setParticipants,
    split,
    setSplit,
    members,
    error,
    save,
  } = useShoppingPurchase();
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (save()) onSaved();
      }}
    >
      <p className="shopping-purchase-hint">
        {t(
          "Choose the items in this purchase. One expense records the total cost and marks these items as bought.",
        )}
      </p>
      <fieldset className="shopping-purchase-items">
        <legend>{t("Purchased items")}</legend>
        {items.map((item) => (
          <label key={item.id}>
            <input
              type="checkbox"
              checked={itemIds.includes(item.id)}
              onChange={(event) => toggleItem(item.id, event.target.checked)}
            />
            <span>
              {item.name}{" "}
              <small>
                {t("(Qty {quantity})", {
                  quantity: formatShoppingQuantity(item),
                })}
              </small>
            </span>
          </label>
        ))}
      </fieldset>
      <Field label={t("Purchase title")}>
        <input
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field label={t("Total cost ({currency})", { currency })}>
        <input
          type="number"
          min={baseAmount > 0 && Number(amount) === 0 ? 0 : 0.01}
          max={maxDisplayInputAmount(
            currency,
            baseAmount <= 100000000 ? baseAmount : undefined,
          )}
          step="0.01"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("Paid by")}>
          <select
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
          >
            {members.map((member) => (
              <option key={member.id}>{member.name}</option>
            ))}
          </select>
        </Field>
        <Field label={t("Purchase date")}>
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
      </div>
      <ExpenseSplitFields
        members={members}
        amount={baseAmount}
        participants={participants}
        onChange={setParticipants}
        split={split}
        onSplitChange={setSplit}
      />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button type="submit" className="primary-button w-full">
        {t("Record purchase")}
      </button>
    </form>
  );
}
export default ShoppingPurchaseForm;
