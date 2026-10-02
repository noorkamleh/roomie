import type { BillFilter } from "../hooks/useBillList";
import StatusFilters from "../../../shared/components/StatusFilters";
const options = [
  { value: "all", label: "All", tone: "purple" },
  { value: "pending", label: "Pending", tone: "purple" },
  { value: "due-soon", label: "Due soon", tone: "amber" },
  { value: "overdue", label: "Overdue", tone: "rose" },
  { value: "paid", label: "Paid", tone: "mint" },
] as const;
function BillFilters({
  filter,
  counts,
  onChange,
}: {
  filter: BillFilter;
  counts: Record<BillFilter, number>;
  onChange: (filter: BillFilter) => void;
}) {
  return (
    <StatusFilters
      label="Filter bills"
      options={options}
      value={filter}
      counts={counts}
      onChange={onChange}
    />
  );
}
export default BillFilters;
