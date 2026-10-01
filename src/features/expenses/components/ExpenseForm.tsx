import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import type { Expense } from "../../../shared/types";
import { localDate } from "../../../shared/utils/dates";
import ExpenseSplitFields from "./ExpenseSplitFields";
import Field from "../../../shared/components/Field";
import { useAction } from "../../../shared/hooks/useAction";

function ExpenseForm({
  expense,
  onSaved,
}: {
  expense?: Expense;
  onSaved: () => void;
}) {
  const { state, commit } = useHousehold();
  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(String(expense?.amount ?? ""));
  const [paidBy, setPaidBy] = useState(expense?.paidBy ?? state.currentUser);
  const [date, setDate] = useState(expense?.date ?? localDate());
  const [category, setCategory] = useState(expense?.category ?? "Groceries");
  const [participants, setParticipants] = useState(
    expense?.participants ?? state.members.map((member) => member.name),
  );
  const { error, perform } = useAction();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          perform(() => {
            const entry: Expense = {
              id: expense?.id ?? crypto.randomUUID(),
              title: title.trim(),
              amount: Number(amount),
              paidBy,
              participants,
              date,
              category,
            };
            commit({ type: "expense.save", expense: entry });
          })
        )
          onSaved();
      }}
    >
      <Field label="Title">
        <input
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount (SAR)">
          <input
            type="number"
            required
            min="0.01"
            max="100000000"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
        <Field label="Paid by">
          <select
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
          >
            {state.members.map((member) => (
              <option key={member.id}>{member.name}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {["Groceries", "Bills", "Household", "Food", "Other"].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </Field>
      </div>
      <ExpenseSplitFields
        members={state.members}
        amount={Number(amount)}
        participants={participants}
        onChange={setParticipants}
      />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="primary-button w-full" type="submit">
        {expense ? "Save changes" : "Add expense"}
      </button>
    </form>
  );
}
export default ExpenseForm;
