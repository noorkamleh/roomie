import { CalendarDays, Plus, Sparkles } from "lucide-react";

function BillsHeader({ onAdd }: { onAdd: () => void }) {
  return (
    <header className="bills-page-header">
      <div>
        <p className="bills-eyebrow">
          <CalendarDays size={14} aria-hidden="true" />
          Household finances
        </p>
        <h1>
          Bills <Sparkles size={25} aria-hidden="true" />
        </h1>
        <p className="bills-page-description">
          Stay ahead of due dates. Record a payment to update expenses and
          balances.
        </p>
      </div>
      <button
        type="button"
        className="primary-button bills-add-button"
        onClick={onAdd}
      >
        <span>
          <Plus size={19} aria-hidden="true" />
        </span>
        Add bill
      </button>
    </header>
  );
}
export default BillsHeader;
