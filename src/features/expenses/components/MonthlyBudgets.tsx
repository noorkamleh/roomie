import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { formatDate } from "../../../shared/utils/dates";
import { useMonthlyBudget } from "../hooks/useMonthlyBudget";
import { calculateBudgetUsage } from "../utils/budgets";
import { expenseMonthLabel } from "../utils/filterExpenses";
import BudgetEditor from "./BudgetEditor";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function BudgetUsageRow({
  name,
  spentCents,
  limitCents,
  remainingCents,
  overCents,
}: {
  name: string;
  spentCents: number;
  limitCents: number;
  remainingCents: number;
  overCents: number;
}) {
  const { t } = usePreferences();
  return (
    <li
      className={`expense-budget-usage-row ${overCents > 0 ? "expense-budget-usage-row--over" : ""}`}
    >
      <div>
        <strong>{t(name)}</strong>
        <p>
          {t("Spent {spent} of {limit}", {
            spent: formatCurrency(spentCents / 100),
            limit: formatCurrency(limitCents / 100),
          })}
        </p>
      </div>
      <p>
        {overCents > 0
          ? t("Over budget by {amount}", {
              amount: formatCurrency(overCents / 100),
            })
          : t("Remaining {amount}", {
              amount: formatCurrency(remainingCents / 100),
            })}
      </p>
    </li>
  );
}

function MonthlyBudgets({ reportMonth }: { reportMonth: string }) {
  const { t, locale } = usePreferences();
  const {
    month,
    budget,
    today,
    expenses,
    categories,
    error,
    saved,
    save,
    clearSaved,
    changeMonth,
  } = useMonthlyBudget(reportMonth);
  const usage = budget ? calculateBudgetUsage(expenses, budget, today) : null;
  return (
    <section
      className="expense-budget-panel"
      aria-labelledby="expense-budget-heading"
    >
      <div className="expense-budget-heading">
        <h2 id="expense-budget-heading">{t("Monthly budgets")}</h2>
        <span>{expenseMonthLabel(month, locale)}</span>
      </div>
      <p className="expense-budget-note">
        {t(
          "Household spending recorded through {date}. Repayments and future-dated expenses are excluded.",
          { date: formatDate(today) },
        )}
      </p>
      {usage && (usage.total || usage.categories.length > 0) ? (
        <ul className="expense-budget-usage" aria-label={t("Budget usage")}>
          {usage.total && (
            <BudgetUsageRow name="Household total" {...usage.total} />
          )}
          {usage.categories.map((entry) => (
            <BudgetUsageRow key={entry.name} {...entry} />
          ))}
        </ul>
      ) : (
        <p className="expense-budget-note">
          {t("No budget set for this month.")}
        </p>
      )}
      <details className="expense-budget-manager">
        <summary>{t("Manage budgets")}</summary>
        <label className="expense-budget-month">
          {t("Budget month")}
          <input
            type="month"
            required
            value={month}
            onChange={(event) => changeMonth(event.target.value)}
          />
        </label>
        <BudgetEditor
          key={`${month}-${JSON.stringify(budget)}`}
          month={month}
          budget={budget}
          categories={categories}
          onSave={save}
          onChange={clearSaved}
        />
      </details>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="expense-budget-saved">
          {t("Budgets saved.")}
        </p>
      )}
    </section>
  );
}

export default MonthlyBudgets;
