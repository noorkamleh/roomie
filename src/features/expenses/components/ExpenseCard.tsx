import { Pencil, Trash2, ReceiptText } from "lucide-react";
import type { Expense } from "../../../shared/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { splitExpense } from "../utils/calculations";

interface ExpenseCardProps {
  expense: Expense;
  linked: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

function ExpenseCard({ expense, linked, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <article className="panel">
      <div className="flex items-start gap-3">
        <div className="feature-icon">
          <ReceiptText size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{expense.title}</h2>
          <p className="mt-1 text-xs text-[#8A809E]">
            {expense.category} / {expense.date} / Paid by {expense.paidBy}
          </p>
        </div>
        <p className="font-bold">{formatCurrency(expense.amount)}</p>
      </div>
      <div className="mt-4 space-y-2 border-t border-[#EFE9F8] pt-4">
        {splitExpense(expense).map((share) => (
          <p
            key={share.member}
            className="flex justify-between text-sm text-[#72658C]"
          >
            <span>{share.member}'s share</span>
            <span>{formatCurrency(share.cents / 100)}</span>
          </p>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        {linked ? (
          <span className="text-xs text-[#8A809E]">
            Created from a paid bill
          </span>
        ) : (
          <>
            <button
              className="icon-button"
              aria-label={`Edit ${expense.title}`}
              onClick={() => onEdit(expense)}
            >
              <Pencil size={17} />
            </button>
            <button
              className="icon-button"
              aria-label={`Delete ${expense.title}`}
              onClick={() => onDelete(expense)}
            >
              <Trash2 size={17} />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
export default ExpenseCard;
