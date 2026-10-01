import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import { localDate } from "../../../shared/utils/dates";
import Field from "../../../shared/components/Field";
function BillForm({ onSaved }: { onSaved: () => void }) {
  const { commit } = useHousehold();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(localDate);
  const { error, perform } = useAction();
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          perform(() =>
            commit({
              type: "bill.add",
              bill: {
                id: crypto.randomUUID(),
                title: title.trim(),
                amount: Number(amount),
                dueDate,
                status: "pending",
              },
            }),
          )
        )
          onSaved();
      }}
    >
      <Field label="Bill title">
        <input
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <Field label="Amount (SAR)">
        <input
          required
          type="number"
          min="0.01"
          max="100000000"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
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
      <button type="submit" className="primary-button w-full">
        Add bill
      </button>
    </form>
  );
}
export default BillForm;
