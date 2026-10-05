import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { ShoppingBasket } from "lucide-react";

function ShoppingHeader() {
  const { t } = usePreferences();
  return (
    <header className="shopping-page-header">
      <p className="shopping-eyebrow">
        <ShoppingBasket size={14} aria-hidden="true" />
        {t("Household essentials")}
      </p>
      <h1>{t("Shopping")}</h1>
      <p className="shopping-page-description">
        {t(
          "One list for everyone. Add quantities and check items off when purchased.",
        )}
      </p>
    </header>
  );
}
export default ShoppingHeader;
