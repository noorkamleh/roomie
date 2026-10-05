import { useState } from "react";
import { Pencil, Trash2, UsersRound } from "lucide-react";
import type { Expense, Member } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { formatDate } from "../../../shared/utils/dates";
import { memberTone } from "../../../shared/utils/memberTone";
import { getAmountCents } from "../../../shared/utils/money";
import { splitExpense } from "../utils/calculations";
import { getExpenseAppearance } from "../../../shared/utils/expenseAppearance";
import Modal from "../../../shared/components/Modal";
import ExpenseSplitDetails from "./ExpenseSplitDetails";
import ExpenseParticipants from "./ExpenseParticipants";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function ExpenseListRow({
  expense,
  currentUser,
  members,
  linked,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  currentUser: string;
  members: Member[];
  linked: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}) {
  const { t } = usePreferences();
  const [showSplit, setShowSplit] = useState(false);
  const { icon: Icon, tone } = getExpenseAppearance(expense);
  const ownShare = splitExpense(expense).find(
    (share) => share.member === currentUser,
  );
  return (
    <li className={`expense-list-row expense-tone-${tone}`}>
      <div className="expense-list-main">
        <span className="expense-category-icon">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="expense-list-title">
          <h3>{expense.title}</h3>
          <p>
            {t(expense.category)} ·{" "}
            <time dateTime={expense.date}>{formatDate(expense.date)}</time>
          </p>
          <p>
            <span
              className="expense-payer-avatar member-identity"
              data-member-tone={memberTone(expense.paidBy)}
              aria-hidden="true"
            >
              {expense.paidBy.slice(0, 1).toUpperCase()}
            </span>
            {t("Paid by {member}", { member: expense.paidBy })}
          </p>
        </div>
        <div className="expense-list-amount">
          <strong>{formatCurrency(getAmountCents(expense) / 100)}</strong>
          <p>
            {ownShare ? t("Your share") : t("You're not in this split")}:{" "}
            {formatCurrency((ownShare?.cents ?? 0) / 100)}
          </p>
        </div>
      </div>
      <div className="expense-list-footer">
        <ExpenseParticipants
          participants={expense.participants}
          members={members}
        />
        <button
          type="button"
          className="expense-view-split"
          aria-label={t("View split for {title}", { title: expense.title })}
          aria-haspopup="dialog"
          onClick={() => setShowSplit(true)}
        >
          <UsersRound size={14} aria-hidden="true" />
          {t("View split")}
        </button>
        {linked ? (
          <span className="expense-linked">
            {t("Created from a paid bill")}
          </span>
        ) : (
          <div className="expense-card-actions">
            <button
              type="button"
              aria-label={t("Edit {title}", { title: expense.title })}
              onClick={() => onEdit(expense)}
            >
              <Pencil size={14} aria-hidden="true" />
              {t("Edit")}
            </button>
            <button
              type="button"
              className="expense-delete"
              aria-label={t("Delete {title}", { title: expense.title })}
              onClick={() => onDelete(expense)}
            >
              <Trash2 size={14} aria-hidden="true" />
              {t("Delete")}
            </button>
          </div>
        )}
      </div>
      {showSplit && (
        <Modal
          title={t("Split for {title}", { title: expense.title })}
          onClose={() => setShowSplit(false)}
        >
          <ExpenseSplitDetails expense={expense} currentUser={currentUser} />
        </Modal>
      )}
    </li>
  );
}

export default ExpenseListRow;
