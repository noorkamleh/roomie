import { useState } from "react";
import type { MonthlyBudget } from "../../../shared/types";
import Field from "../../../shared/components/Field";
import { budgetAmountCents } from "../utils/budgets";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { toCents } from "../../../shared/utils/money";
import { toBaseAmount, type Currency } from "../../../shared/preferences/model";
import { maxDisplayInputAmount } from "../utils/currencyAmounts";

type BudgetDraft = { value: string; currency: Currency };

function BudgetEditor({
  month,
  budget,
  categories,
  onSave,
  onChange,
}: {
  month: string;
  budget?: MonthlyBudget;
  categories: string[];
  onSave: (budget: MonthlyBudget) => boolean;
  onChange: () => void;
}) {
  const { t, currency, toDisplayAmount } = usePreferences();
  const currencyLabel = currency === "SAR" ? t("SAR") : "$";
  const [total, setTotal] = useState<BudgetDraft>({
    value: budget?.totalCents
      ? String(toDisplayAmount(budget.totalCents / 100))
      : "",
    currency,
  });
  const [totalChanged, setTotalChanged] = useState(false);
  const [changedCategories, setChangedCategories] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, BudgetDraft>>(
    Object.fromEntries(
      Object.entries(budget?.categories ?? {}).map(([name, cents]) => [
        name,
        { value: String(toDisplayAmount(cents / 100)), currency },
      ]),
    ),
  );
  const [error, setError] = useState<string | null>(null);

  function draftValue(draft: BudgetDraft, pristineCents?: number) {
    if (draft.currency === currency || !draft.value.trim()) return draft.value;
    const baseAmount =
      pristineCents !== undefined
        ? pristineCents / 100
        : toBaseAmount(Number(draft.value), draft.currency);
    return Number.isFinite(baseAmount)
      ? String(toDisplayAmount(baseAmount))
      : draft.value;
  }

  function saveCents(draft: BudgetDraft, pristineCents?: number) {
    const displayCents = budgetAmountCents(draft.value);
    return (
      pristineCents ?? toCents(toBaseAmount(displayCents / 100, draft.currency))
    );
  }

  const errorMessage =
    error === "Enter budget amounts in SAR with at most two decimal places."
      ? t(
          "Enter budget amounts in {currency} with at most two decimal places.",
          { currency: currency === "SAR" ? "SAR" : "USD" },
        )
      : error === "Budget amounts must be between SAR 0 and SAR 100,000,000."
        ? t("Choose a budget amount within the shown limit.")
        : error
          ? t(error)
          : "";
  return (
    <form
      className="expense-budget-form"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          const entry = {
            month,
            totalCents: saveCents(
              total,
              budget && !totalChanged ? budget.totalCents : undefined,
            ),
            categories: Object.fromEntries(
              Object.entries(values)
                .filter(([, draft]) => draft.value.trim())
                .map(([name, draft]) => [
                  name,
                  saveCents(
                    draft,
                    budget && !changedCategories.includes(name)
                      ? budget.categories[name]
                      : undefined,
                  ),
                ]),
            ),
          };
          setError(null);
          onSave(entry);
        } catch (failure) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Check your budget amounts.",
          );
        }
      }}
    >
      <Field
        label={t("Monthly household budget ({currency})", {
          currency: currencyLabel,
        })}
      >
        <input
          type="number"
          min="0"
          max={maxDisplayInputAmount(
            currency,
            budget && !totalChanged ? budget.totalCents / 100 : undefined,
          )}
          step="0.01"
          placeholder={t("No overall limit")}
          value={draftValue(
            total,
            budget && !totalChanged ? budget.totalCents : undefined,
          )}
          onChange={(event) => {
            setTotal({ value: event.target.value, currency });
            setTotalChanged(true);
            onChange();
          }}
        />
      </Field>
      <fieldset className="expense-budget-categories">
        <legend>
          {t("Category budgets ({currency})", { currency: currencyLabel })}
        </legend>
        <p>{t("Leave a field blank for no category limit.")}</p>
        <div>
          {categories.map((name) => (
            <Field
              key={name}
              label={t("{category} budget", { category: t(name) })}
            >
              <input
                type="number"
                min="0"
                max={maxDisplayInputAmount(
                  currency,
                  budget &&
                    !changedCategories.includes(name) &&
                    budget.categories[name] !== undefined
                    ? budget.categories[name] / 100
                    : undefined,
                )}
                step="0.01"
                placeholder={t("No limit")}
                value={draftValue(
                  values[name] ?? { value: "", currency },
                  budget && !changedCategories.includes(name)
                    ? budget.categories[name]
                    : undefined,
                )}
                onChange={(event) => {
                  setValues({
                    ...values,
                    [name]: { value: event.target.value, currency },
                  });
                  setChangedCategories((current) => [...current, name]);
                  onChange();
                }}
              />
            </Field>
          ))}
        </div>
      </fieldset>
      {error && (
        <p className="form-error" role="alert">
          {errorMessage}
        </p>
      )}
      <button type="submit" className="secondary-button">
        {t("Save budgets")}
      </button>
    </form>
  );
}

export default BudgetEditor;
