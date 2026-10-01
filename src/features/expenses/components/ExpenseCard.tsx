import { CalendarDays, Check, Pencil, Trash2, UsersRound } from "lucide-react";
import type { Expense } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { splitExpense } from "../utils/calculations";
import {
  formatExpenseDate,
  formatExpenseAmount,
  getCategoryAppearance,
} from "./expensePresentation";

interface ExpenseCardProps {
  expense: Expense;
  linked: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}
function ExpenseCard({ expense, linked, onEdit, onDelete }: ExpenseCardProps) {
  const { icon: Icon, tone } = getCategoryAppearance(expense.category);
  const shares = splitExpense(expense);
  return (
    <article className={`expense-card expense-tone-${tone}`}>
      <div className="expense-card-topline">
        <span className="expense-category">
          <Icon size={13} aria-hidden="true" />
          {expense.category}
        </span>
        <time dateTime={expense.date}>
          <CalendarDays size={12} aria-hidden="true" />
          {formatExpenseDate(expense.date)}
        </time>
      </div>
      <div className="expense-card-main">
        <div className="expense-category-icon">
          <Icon size={23} strokeWidth={1.7} aria-hidden="true" />
        </div>
        <div className="expense-card-title">
          <h3>{expense.title}</h3>
          <p>
            <span className="expense-payer-avatar" aria-hidden="true">
              {expense.paidBy.slice(0, 1).toUpperCase()}
            </span>
            Paid by <strong>{expense.paidBy}</strong>
          </p>
        </div>
        <p className="expense-amount">
          <span>SAR</span>
          {formatExpenseAmount(expense.amount)}
        </p>
      </div>
      <div className="expense-shares">
        <p className="expense-shares-label">
          <UsersRound size={14} aria-hidden="true" />
          Shared between
        </p>
        <div className="expense-share-grid">
          {shares.map((share, index) => (
            <div key={share.member} className="expense-share">
              <span
                className={`expense-share-avatar expense-person-${index % 3}`}
                aria-hidden="true"
              >
                {share.member.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p>{share.member}'s share</p>
                <strong>{formatCurrency(share.cents / 100)}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="expense-card-footer">
        <span className="expense-recorded">
          <Check size={12} aria-hidden="true" />
          Recorded expense
        </span>
        {linked ? (
          <span className="expense-linked">Created from a paid bill</span>
        ) : (
          <div className="expense-card-actions">
            <button
              type="button"
              aria-label={`Edit ${expense.title}`}
              onClick={() => onEdit(expense)}
            >
              <Pencil size={14} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              className="expense-delete"
              aria-label={`Delete ${expense.title}`}
              onClick={() => onDelete(expense)}
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
export default ExpenseCard;
