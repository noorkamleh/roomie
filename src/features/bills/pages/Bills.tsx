import "../styles/bills.css";
import BillsHeader from "../components/BillsHeader";
import EmptyState from "../../../shared/components/EmptyState";
import Modal from "../../../shared/components/Modal";
import BillForm from "../components/BillForm";
import BillCard from "../components/BillCard";
import BillFilters from "../components/BillFilters";
import BillPaymentForm from "../components/BillPaymentForm";
import { useBillList } from "../hooks/useBillList";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function Bills() {
  const { t } = usePreferences();
  const {
    entries,
    expenses,
    counts,
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
      <BillFilters filter={filter} counts={counts} onChange={setFilter} />
      <div className="bill-card-grid">
        {entries.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            today={today}
            onPay={openPayment}
            expense={expenses.find(
              (expense) => expense.id === `bill-${bill.id}`,
            )}
          />
        ))}
      </div>
      {entries.length === 0 && (
        <EmptyState message={t("No bills in this view.")} />
      )}
      {adding && (
        <Modal title={t("Add bill")} onClose={closeAdd}>
          <BillForm onSaved={closeAdd} />
        </Modal>
      )}
      {paying && (
        <Modal
          title={t("Pay {title}", { title: paying.title })}
          onClose={closePayment}
        >
          <BillPaymentForm bill={paying} onSaved={closePayment} />
        </Modal>
      )}
    </div>
  );
}
export default Bills;
