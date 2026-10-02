import PageHeader from "../../../shared/components/PageHeader";
import ShoppingForm from "../components/ShoppingForm";
import ShoppingFilters from "../components/ShoppingFilters";
import ShoppingList from "../components/ShoppingList";
import { useShoppingList } from "../hooks/useShoppingList";

function Shopping() {
  const { entries, filter, setFilter, error, toggleItem, removeItem } =
    useShoppingList();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shopping"
        description="One list for everyone. Add quantities and check items off when purchased."
      />
      <ShoppingForm />
      <ShoppingFilters filter={filter} onChange={setFilter} />
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
    </div>
  );
}
export default Shopping;
