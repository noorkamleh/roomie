import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import PageHeader from "../../../shared/components/PageHeader";
import EmptyState from "../../../shared/components/EmptyState";
import ShoppingForm from "../components/ShoppingForm";
function Shopping() {
  const { state, commit } = useHousehold();
  const [filter, setFilter] = useState("all");
  const { error, perform } = useAction();
  const entries = state.shoppingItems.filter(
    (item) =>
      filter === "all" ||
      (filter === "bought" ? item.completed : !item.completed),
  );
  return (
    <div className="space-y-6">
      <PageHeader
        title="Shopping"
        description="One list for everyone. Add quantities and check items off when purchased."
      />
      <ShoppingForm />
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter shopping items"
      >
        {["all", "needed", "bought"].map((status) => (
          <button
            key={status}
            className={`filter-button ${filter === status ? "is-active" : ""}`}
            aria-pressed={filter === status}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="panel space-y-3">
        {entries.map((item) => (
          <div
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#F0EAF8] bg-[#FDFBFF] p-4"
            key={item.id}
          >
            <label className="flex flex-1 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() =>
                  perform(() =>
                    commit({ type: "shopping.toggle", id: item.id }),
                  )
                }
              />
              <span
                className={
                  item.completed ? "text-[#9C90AC] line-through" : "font-medium"
                }
              >
                {item.name}
              </span>
              <span className="rounded-lg bg-[#F0E9FF] px-2 py-1 text-xs text-[#8659BE]">
                Qty {item.quantity}
              </span>
            </label>
            <button
              className="icon-button"
              aria-label={`Delete ${item.name}`}
              onClick={() => {
                if (window.confirm(`Remove ${item.name} from the list?`))
                  perform(() =>
                    commit({ type: "shopping.delete", id: item.id }),
                  );
              }}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
        {entries.length === 0 && (
          <EmptyState message="Your shopping list is clear. Add what your household needs." />
        )}
      </div>
    </div>
  );
}
export default Shopping;
