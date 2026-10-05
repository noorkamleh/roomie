import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import type { ChoreFilter } from "../hooks/useChoreList";
import StatusFilters from "../../../shared/components/StatusFilters";
const options = [
  { value: "all", label: "All", tone: "purple" },
  { value: "pending", label: "Pending", tone: "purple" },
  { value: "in-progress", label: "In progress", tone: "blue" },
  { value: "completed", label: "Completed", tone: "mint" },
] as const;
function ChoreFilters({
  filter,
  counts,
  onChange,
}: {
  filter: ChoreFilter;
  counts: Record<ChoreFilter, number>;
  onChange: (filter: ChoreFilter) => void;
}) {
  const { t } = usePreferences();
  return (
    <StatusFilters
      label={t("Filter chores")}
      options={options.map((option) => ({ ...option, label: t(option.label) }))}
      value={filter}
      counts={counts}
      onChange={onChange}
    />
  );
}
export default ChoreFilters;
