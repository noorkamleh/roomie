import { Plus } from "lucide-react";
import PageHeader from "../../../shared/components/PageHeader";
import EmptyState from "../../../shared/components/EmptyState";
import Modal from "../../../shared/components/Modal";
import BillForm from "../components/BillForm";
import BillCard from "../components/BillCard";
import BillFilters from "../components/BillFilters";
import ExpenseForm from "../../expenses/components/ExpenseForm";
import { useBillList } from "../hooks/useBillList";

function Bills() {
  const {
    entries,
    today,
    filter,
    setFilter,
    adding,
    openAdd,
    closeAdd,
    paying,
    openPayment,
    closePayment,
  } = useBillList();
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
      <BillFilters filter={filter} onChange={setFilter} />
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            today={today}
            onPay={openPayment}
          />
        ))}
      </div>
      {entries.length === 0 && <EmptyState message="No bills in this view." />}
      {adding && (
        <Modal title="Add bill" onClose={closeAdd}>
          <BillForm onSaved={closeAdd} />
        </Modal>
      )}
      {paying && (
        <Modal title={`Pay ${paying.title}`} onClose={closePayment}>
          <ExpenseForm bill={paying} onSaved={closePayment} />
        </Modal>
      )}
    </div>
  );
}
export default Bills;
