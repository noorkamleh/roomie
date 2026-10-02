import type { Expense } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { splitExpense } from "../utils/calculations";

function ExpenseSplitDetails({
  expense,
  currentUser,
}: {
  expense: Expense;
  currentUser: string;
}) {
  return (
    <div className="expense-split-details">
      <p className="expense-split-total">
        {formatCurrency(expense.amount)} <span>paid by {expense.paidBy}</span>
      </p>
      <p className="expense-shares-label">
        Split between {expense.participants.length} people
      </p>
      <ul className="expense-share-grid" aria-label="Expense split">
        {splitExpense(expense).map((share, index) => (
          <li key={share.member} className="expense-share">
            <span
              className={`expense-share-avatar expense-person-${index % 3}`}
              aria-hidden="true"
            >
              {share.member.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p>
                {share.member}
                {share.member === currentUser ? " (you)" : ""}
              </p>
              <strong>{formatCurrency(share.cents / 100)}</strong>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default ExpenseSplitDetails;
