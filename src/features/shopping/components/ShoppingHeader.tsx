import { ShoppingBasket } from "lucide-react";

function ShoppingHeader() {
  return (
    <header className="shopping-page-header">
      <p className="shopping-eyebrow">
        <ShoppingBasket size={14} aria-hidden="true" />
        Household essentials
      </p>
      <h1>Shopping</h1>
      <p className="shopping-page-description">
        One list for everyone. Add quantities and check items off when
        purchased.
      </p>
    </header>
  );
}
export default ShoppingHeader;
