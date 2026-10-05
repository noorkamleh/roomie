import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import { localDate } from "../../../shared/utils/dates";
import Field from "../../../shared/components/Field";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { toBaseAmount as convertToBaseAmount } from "../../../shared/preferences/model";
import { maxDisplayInputAmount } from "../../expenses/utils/currencyAmounts";
function BillForm({ onSaved }: { onSaved: () => void }) {
  const { t, currency, toDisplayAmount } = usePreferences();
  const { commit } = useHousehold();
  const [title, setTitle] = useState("");
  const [amountDraft, setAmountDraft] = useState({ value: "", currency });
  const baseAmount = convertToBaseAmount(
    Number(amountDraft.value),
    amountDraft.currency,
  );
  const amount =
    amountDraft.currency === currency || !amountDraft.value.trim()
      ? amountDraft.value
      : String(toDisplayAmount(baseAmount));
  const [dueDate, setDueDate] = useState(localDate);
  const [monthly, setMonthly] = useState(false);
  const { error, perform } = useAction();
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          perform(() => {
            const id = crypto.randomUUID();
            commit({
              type: "bill.add",
              bill: {
                id,
                title: title.trim(),
                amount: baseAmount,
                dueDate,
                status: "pending",
                ...(monthly
                  ? {
                      seriesId: id,
                      recurrence: {
                        frequency: "monthly",
                        anchorDay: Number(dueDate.slice(-2)),
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
      <Field label={t("Bill title")}>
        <input
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field
        label={t("Amount ({currency})", {
          currency: currency === "SAR" ? t("SAR") : "$",
        })}
      >
        <input
          required
          type="number"
          min={baseAmount > 0 && Number(amount) === 0 ? "0" : "0.01"}
          max={maxDisplayInputAmount(currency)}
          step="0.01"
          value={amount}
          onChange={(event) =>
            setAmountDraft({ value: event.target.value, currency })
          }
        />
      </Field>
      <Field label={t("Due date")}>
        <input
          type="date"
          required
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </Field>
      <label className="bill-monthly-option">
        <input
          type="checkbox"
          checked={monthly}
          onChange={(event) => setMonthly(event.target.checked)}
        />
        {t("Repeat monthly")}
      </label>
      {monthly && (
        <p className="bill-monthly-hint">
          {t(
            "Recording a payment adds next month's bill. Each payment stays in your history.",
          )}
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button type="submit" className="primary-button w-full">
        {t("Add bill")}
      </button>
    </form>
  );
}
export default BillForm;
