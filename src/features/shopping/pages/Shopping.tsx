import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import "../styles/shopping.css";
import ShoppingHeader from "../components/ShoppingHeader";
import ShoppingForm from "../components/ShoppingForm";
import ShoppingFilters from "../components/ShoppingFilters";
import ShoppingList from "../components/ShoppingList";
import { useShoppingList } from "../hooks/useShoppingList";
import Modal from "../../../shared/components/Modal";
import ShoppingPurchaseForm from "../components/ShoppingPurchaseForm";

function Shopping() {
  const { t } = usePreferences();
  const {
    entries,
    filter,
    counts,
    setFilter,
    error,
    toggleItem,
    removeItem,
    purchasing,
    openPurchase,
    closePurchase,
    canRecordPurchase,
  } = useShoppingList();
  return (
    <div className="shopping-page">
      <ShoppingHeader />
      <ShoppingForm />
      <div className="shopping-purchase-action">
        <p>{t("Keep shopping costs in your household expenses.")}</p>
        <button
          type="button"
          className="secondary-button"
          disabled={!canRecordPurchase}
          onClick={openPurchase}
        >
          {t("Record shopping cost")}
        </button>
      </div>
      <ShoppingFilters filter={filter} counts={counts} onChange={setFilter} />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <ShoppingList
        entries={entries}
        onToggle={toggleItem}
        onRemove={removeItem}
      />
      {purchasing && (
        <Modal title={t("Record shopping cost")} onClose={closePurchase}>
          <ShoppingPurchaseForm onSaved={closePurchase} />
        </Modal>
      )}
    </div>
  );
}
export default Shopping;
