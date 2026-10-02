import { useState } from "react";
import type { ShoppingItem } from "../../../shared/types";
import { useAction } from "../../../shared/hooks/useAction";
import { useHousehold } from "../../household/hooks/HouseholdContext";

export type ShoppingFilter = "all" | "needed" | "bought";

export function useShoppingList() {
  const { state, commit } = useHousehold();
  const [filter, setFilter] = useState<ShoppingFilter>("all");
  const { error, perform } = useAction();
  const entries = state.shoppingItems.filter(
    (item) =>
      filter === "all" ||
      (filter === "bought" ? item.completed : !item.completed),
  );

  function toggleItem(item: ShoppingItem) {
    perform(() => commit({ type: "shopping.toggle", id: item.id }));
  }

  function removeItem(item: ShoppingItem) {
    if (window.confirm(`Remove ${item.name} from the list?`))
      perform(() => commit({ type: "shopping.delete", id: item.id }));
  }

  return { entries, filter, setFilter, error, toggleItem, removeItem };
}
