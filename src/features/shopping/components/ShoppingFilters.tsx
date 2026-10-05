import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import type { ShoppingFilter } from "../hooks/useShoppingList";
import StatusFilters from "../../../shared/components/StatusFilters";

const filters = [
  { value: "all", label: "All", tone: "purple" },
  { value: "needed", label: "Needed", tone: "amber" },
  { value: "bought", label: "Bought", tone: "mint" },
] as const;

function ShoppingFilters({
  filter,
  onChange,
  counts,
}: {
  filter: ShoppingFilter;
  onChange: (filter: ShoppingFilter) => void;
  counts: Record<ShoppingFilter, number>;
}) {
  const { t } = usePreferences();
  return (
    <StatusFilters
      label={t("Filter shopping items")}
      options={filters.map((option) => ({ ...option, label: t(option.label) }))}
      value={filter}
      counts={counts}
      onChange={onChange}
    />
  );
}
export default ShoppingFilters;
