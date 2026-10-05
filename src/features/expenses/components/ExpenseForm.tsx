import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import type { Expense, ExpenseSplit } from "../../../shared/types";
import { localDate } from "../../../shared/utils/dates";
import ExpenseSplitFields from "./ExpenseSplitFields";
import Field from "../../../shared/components/Field";
import { useAction } from "../../../shared/hooks/useAction";
import { getAmountCents, toCents } from "../../../shared/utils/money";
import { splitExpense } from "../utils/calculations";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { toBaseAmount as convertToBaseAmount } from "../../../shared/preferences/model";
import { maxDisplayInputAmount } from "../utils/currencyAmounts";

function ExpenseForm({
  expense,
  onSaved,
}: {
  expense?: Expense;
  onSaved: () => void;
}) {
  const { t, currency, toDisplayAmount } = usePreferences();
  const { state, commit } = useHousehold();
  const historicalNames = expense
    ? [expense.paidBy, ...expense.participants]
    : [];
  const formMembers = state.members.filter(
    (member) => !member.archived || historicalNames.includes(member.name),
  );
  const [title, setTitle] = useState(expense?.title ?? "");
  const [amountDraft, setAmountDraft] = useState({
    value: expense
      ? String(toDisplayAmount(getAmountCents(expense) / 100))
      : "",
    currency,
  });
  const [amountChanged, setAmountChanged] = useState(false);
  const baseAmount =
    expense && !amountChanged
      ? getAmountCents(expense) / 100
      : convertToBaseAmount(Number(amountDraft.value), amountDraft.currency);
  const amount =
    amountDraft.currency === currency || !amountDraft.value.trim()
      ? amountDraft.value
      : String(toDisplayAmount(baseAmount));
  const [paidBy, setPaidBy] = useState(expense?.paidBy ?? state.currentUser);
  const [date, setDate] = useState(expense?.date ?? localDate());
  const [category, setCategory] = useState(expense?.category ?? "Groceries");
  const [participants, setParticipants] = useState(
    expense?.participants ?? formMembers.map((member) => member.name),
  );
  const [split, setSplit] = useState<ExpenseSplit | undefined>(expense?.split);
  const { error, perform } = useAction();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (
          perform(() => {
            const entry: Expense = {
              ...expense,
              id: expense?.id ?? crypto.randomUUID(),
              title: title.trim(),
              amount: baseAmount,
              amountCents: toCents(baseAmount),
              paidBy,
              participants,
              date,
              category,
              split,
            };
            splitExpense(entry);
            commit({ type: "expense.save", expense: entry });
          })
        )
          onSaved();
      }}
    >
      <Field label={t("Title")}>
        <input
          required
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("Amount ({currency})", {
            currency: currency === "SAR" ? t("SAR") : "$",
          })}
        >
          <input
            type="number"
            required
            min={baseAmount > 0 && Number(amount) === 0 ? "0" : "0.01"}
            max={maxDisplayInputAmount(
              currency,
              expense && !amountChanged
                ? getAmountCents(expense) / 100
                : undefined,
            )}
            step="0.01"
            value={amount}
            onChange={(event) => {
              setAmountDraft({ value: event.target.value, currency });
              setAmountChanged(true);
            }}
          />
        </Field>
        <Field label={t("Paid by")}>
          <select
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
          >
            {formMembers.map((member) => (
              <option key={member.id} value={member.name}>
                {member.name}
                {member.archived ? t(" (Archived)") : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("Date")}>
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>
        <Field label={t("Category")}>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {["Groceries", "Bills", "Household", "Food", "Other"].map(
              (item) => (
                <option key={item} value={item}>
                  {t(item)}
                </option>
              ),
            )}
          </select>
        </Field>
      </div>
      <ExpenseSplitFields
        members={formMembers}
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
      <button className="primary-button w-full" type="submit">
        {expense ? t("Save changes") : t("Add expense")}
      </button>
    </form>
  );
}
export default ExpenseForm;
