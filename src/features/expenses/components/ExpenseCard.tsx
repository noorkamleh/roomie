import { CalendarDays, Pencil, Trash2, UsersRound } from "lucide-react";
import { useState } from "react";
import Modal from "../../../shared/components/Modal";
import ExpenseSplitDetails from "./ExpenseSplitDetails";
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
  currentUser: string;
  linked: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}
function ExpenseCard({
  expense,
  currentUser,
  linked,
  onEdit,
  onDelete,
}: ExpenseCardProps) {
  const [showSplit, setShowSplit] = useState(false);
  const { icon: Icon, tone } = getCategoryAppearance(expense.category);
  const shares = splitExpense(expense);
  const ownShare = shares.find((share) => share.member === currentUser);
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
      <div className="expense-share-summary">
        <p className="expense-own-share">
          <span>{ownShare ? "Your share" : "You're not in this split"}</span>
          <strong>{formatCurrency((ownShare?.cents ?? 0) / 100)}</strong>
        </p>
        <div
          className="expense-participants"
          aria-label={`Participants: ${expense.participants.join(", ")}`}
        >
          {expense.participants.slice(0, 4).map((member, index) => (
            <span
              key={member}
              title={member}
              className={`expense-share-avatar expense-person-${index % 3}`}
            >
              {member.slice(0, 1).toUpperCase()}
            </span>
          ))}
          {expense.participants.length > 4 && (
            <span className="expense-share-avatar expense-person-0">
              +{expense.participants.length - 4}
            </span>
          )}
        </div>
      </div>
      <div className="expense-card-footer">
        <button
          type="button"
          className="expense-view-split"
          aria-label={`View split for ${expense.title}`}
          aria-haspopup="dialog"
          onClick={() => setShowSplit(true)}
        >
          <UsersRound size={14} aria-hidden="true" />
          View split
        </button>
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
      {showSplit && (
        <Modal
          title={`Split for ${expense.title}`}
          onClose={() => setShowSplit(false)}
        >
          <ExpenseSplitDetails expense={expense} currentUser={currentUser} />
        </Modal>
      )}
    </article>
  );
}
export default ExpenseCard;
