import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import type { Expense, Bill } from "../../../shared/types";
import { localDate } from "../../../shared/utils/dates";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { isMoney } from "../../household/model/validation";
import { splitExpense } from "../utils/calculations";
import Field from "../../../shared/components/Field";
import { useAction } from "../../../shared/hooks/useAction";

function ExpenseForm({
  expense,
  bill,
  onSaved,
}: {
  expense?: Expense;
  bill?: Bill;
  onSaved: () => void;
}) {
  const { state, commit } = useHousehold();
  const [title, setTitle] = useState(expense?.title ?? bill?.title ?? "");
  const [amount, setAmount] = useState(
    String(expense?.amount ?? bill?.amount ?? ""),
  );
  const [paidBy, setPaidBy] = useState(expense?.paidBy ?? state.currentUser);
  const [date, setDate] = useState(expense?.date ?? localDate());
  const [category, setCategory] = useState(
    expense?.category ?? (bill ? "Bills" : "Groceries"),
  );
  const [participants, setParticipants] = useState(
    expense?.participants ?? state.members.map((member) => member.name),
  );
  const { error, perform } = useAction();
  const shares =
    isMoney(Number(amount)) && participants.length > 0
      ? splitExpense({ amount: Number(amount), participants })
      : [];

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
            commit(
              bill
                ? { type: "bill.pay", id: bill.id, expense: entry }
                : { type: "expense.save", expense: entry },
            );
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
          readOnly={Boolean(bill)}
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
            readOnly={Boolean(bill)}
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
            disabled={Boolean(bill)}
          >
            {["Groceries", "Bills", "Household", "Food", "Other"].map(
              (item) => (
                <option key={item}>{item}</option>
              ),
            )}
          </select>
        </Field>
      </div>
      <fieldset className="rounded-2xl border border-[#EAE3F7] p-4">
        <legend className="px-2 text-sm font-semibold text-[#4A3F6C]">
          Split between
        </legend>
        <div className="flex flex-wrap gap-4">
          {state.members.map((member) => (
            <label key={member.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={participants.includes(member.name)}
                onChange={(event) =>
                  setParticipants(
                    event.target.checked
                      ? [...participants, member.name]
                      : participants.filter((name) => name !== member.name),
                  )
                }
              />
              {member.name}
            </label>
          ))}
        </div>
        {shares.length > 0 && (
          <div className="mt-4 space-y-1 border-t border-[#EFE9F8] pt-3">
            {shares.map((share) => (
              <p
                key={share.member}
                className="flex justify-between text-xs text-[#817595]"
              >
                <span>{share.member}'s share</span>
                <span>{formatCurrency(share.cents / 100)}</span>
              </p>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-[#8A809E]">
          Shares are equal; any remaining halalas go to the first selected
          members.
        </p>
      </fieldset>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="primary-button w-full" type="submit">
        {bill ? "Confirm payment" : expense ? "Save changes" : "Add expense"}
      </button>
    </form>
  );
}
export default ExpenseForm;
