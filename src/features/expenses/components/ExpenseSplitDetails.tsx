import type { Expense } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { splitExpense } from "../utils/calculations";
import { getAmountCents } from "../../../shared/utils/money";
import { memberTone } from "../../../shared/utils/memberTone";
import { formatShoppingQuantity } from "../../shopping/utils/quantity";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function ExpenseSplitDetails({
  expense,
  currentUser,
}: {
  expense: Expense;
  currentUser: string;
}) {
  const { t } = usePreferences();
  return (
    <div className="expense-split-details">
      <p className="expense-split-total">
        {formatCurrency(getAmountCents(expense) / 100)}{" "}
        <span>{t("paid by {member}", { member: expense.paidBy })}</span>
      </p>
      <p className="expense-shares-label">
        {expense.split?.mode === "amounts"
          ? t("Split by exact amounts")
          : expense.split?.mode === "percentages"
            ? t("Split by percentages")
            : t("Split equally")}{" "}
        {t("between {count} people", { count: expense.participants.length })}
      </p>
      <ul className="expense-share-grid" aria-label={t("Expense split")}>
        {splitExpense(expense).map((share) => (
          <li key={share.member} className="expense-share">
            <span
              className="expense-share-avatar member-identity"
              data-member-tone={memberTone(share.member)}
              aria-hidden="true"
            >
              {share.member.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p>
                {share.member}
                {share.member === currentUser ? t(" (you)") : ""}
                {expense.split?.mode === "percentages" && (
                  <span>
                    {" "}
                    · {expense.split.basisPoints[share.member] / 100}%
                  </span>
                )}
              </p>
              <strong>{formatCurrency(share.cents / 100)}</strong>
            </div>
          </li>
        ))}
      </ul>
      {expense.shoppingItems && expense.shoppingItems.length > 0 && (
        <section
          className="expense-purchased-items"
          aria-label={t("Purchased items")}
        >
          <h3>{t("Purchased items")}</h3>
          <ul>
            {expense.shoppingItems.map((item) => (
              <li key={item.id}>
                <span>{item.name}</span>
                <span>
                  {t("Quantity {quantity}", {
                    quantity: formatShoppingQuantity(item),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
export default ExpenseSplitDetails;
