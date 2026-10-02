import "../styles/shopping.css";
import ShoppingHeader from "../components/ShoppingHeader";
import ShoppingForm from "../components/ShoppingForm";
import ShoppingFilters from "../components/ShoppingFilters";
import ShoppingList from "../components/ShoppingList";
import { useShoppingList } from "../hooks/useShoppingList";

function Shopping() {
  const { entries, filter, setFilter, error, toggleItem, removeItem } =
    useShoppingList();
  return (
    <div className="shopping-page">
      <ShoppingHeader />
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
