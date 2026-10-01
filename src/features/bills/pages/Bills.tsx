import "../styles/bills.css";
import BillsHeader from "../components/BillsHeader";
import EmptyState from "../../../shared/components/EmptyState";
import Modal from "../../../shared/components/Modal";
import BillForm from "../components/BillForm";
import BillCard from "../components/BillCard";
import BillFilters from "../components/BillFilters";
import BillPaymentForm from "../components/BillPaymentForm";
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
    <div className="bills-page">
      <BillsHeader onAdd={openAdd} />
      <BillFilters filter={filter} onChange={setFilter} />
      <div className="bill-card-grid">
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
          <BillPaymentForm bill={paying} onSaved={closePayment} />
        </Modal>
      )}
    </div>
  );
}
export default Bills;
