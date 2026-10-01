import { useAddDialog } from "../../../shared/hooks/useAddDialog";
import { useState } from "react";
import { Plus, CalendarDays } from "lucide-react";
import type { Bill } from "../../../shared/types";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useToday } from "../../../shared/hooks/useToday";
import { dueLabel } from "../../../shared/utils/dates";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { billStatus } from "../utils/status";
import PageHeader from "../../../shared/components/PageHeader";
import StatusBadge from "../../../shared/components/StatusBadge";
import EmptyState from "../../../shared/components/EmptyState";
import Modal from "../../../shared/components/Modal";
import BillForm from "../components/BillForm";
import ExpenseForm from "../../expenses/components/ExpenseForm";
function Bills() {
  const { state } = useHousehold();
  const today = useToday();
  const { isOpen: adding, open: openAdd, close: closeAdd } = useAddDialog();
  const [paying, setPaying] = useState<Bill | null>(null);
  const [filter, setFilter] = useState("all");
  const entries = [...state.bills]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .filter((bill) => filter === "all" || billStatus(bill, today) === filter);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bills"
        description="Stay ahead of due dates. Record a payment to update expenses and balances."
        action={
          <button className="primary-button" onClick={openAdd}>
            <Plus size={18} />
            Add bill
          </button>
        }
      />
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter bills"
      >
        {["all", "pending", "due-soon", "overdue", "paid"].map((status) => (
          <button
            key={status}
            className={`filter-button ${filter === status ? "is-active" : ""}`}
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
          >
            {status.replaceAll("-", " ")}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((bill) => (
          <article className="panel" key={bill.id}>
            <div className="flex items-start gap-3">
              <div className="feature-icon">
                <CalendarDays size={22} />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">{bill.title}</h2>
                <p className="mt-1 text-xs text-[#8A809E]">
                  Due {bill.dueDate}
                </p>
              </div>
              <StatusBadge status={billStatus(bill, today)} />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(bill.amount)}
                </p>
                {bill.status !== "paid" && (
                  <p className="mt-1 text-xs text-[#8A809E]">
                    {dueLabel(bill.dueDate, today)}
                  </p>
                )}
              </div>
              {bill.status !== "paid" && (
                <button
                  className="secondary-button"
                  onClick={() => setPaying(bill)}
                >
                  Mark as paid
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {entries.length === 0 && <EmptyState message="No bills in this view." />}
      {adding && (
        <Modal title="Add bill" onClose={closeAdd}>
          <BillForm onSaved={closeAdd} />
        </Modal>
      )}
      {paying && (
        <Modal title={`Pay ${paying.title}`} onClose={() => setPaying(null)}>
          <ExpenseForm bill={paying} onSaved={() => setPaying(null)} />
        </Modal>
      )}
    </div>
  );
}
export default Bills;
