import { useState } from "react";
import type { ShoppingItem } from "../../../shared/types";
import { useAction } from "../../../shared/hooks/useAction";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useConfirmation } from "../../../shared/confirmation/ConfirmationContext";

export type ShoppingFilter = "all" | "needed" | "bought";

export function useShoppingList() {
  const { state, commit } = useHousehold();
  const confirm = useConfirmation();
  const [filter, setFilter] = useState<ShoppingFilter>("all");
  const [purchasing, setPurchasing] = useState(false);
  const { error, perform } = useAction();
  const entries = [...state.shoppingItems]
    .sort((a, b) => Number(a.completed) - Number(b.completed))
    .filter(
      (item) =>
        filter === "all" ||
        (filter === "bought" ? item.completed : !item.completed),
    );

  function toggleItem(item: ShoppingItem) {
    perform(() => commit({ type: "shopping.toggle", id: item.id }));
  }

  async function removeItem(item: ShoppingItem) {
    if (
      await confirm({
        title: "Delete shopping item",
        message: "Remove {name} from the list?",
        params: { name: item.name },
        confirmLabel: "Delete",
        intent: "danger",
      })
    )
      perform(() => commit({ type: "shopping.delete", id: item.id }));
  }

  return {
    entries,
    filter,
    counts: {
      all: state.shoppingItems.length,
      needed: state.shoppingItems.filter((item) => !item.completed).length,
      bought: state.shoppingItems.filter((item) => item.completed).length,
    },
    setFilter,
    error,
    toggleItem,
    removeItem,
    purchasing,
    openPurchase: () => setPurchasing(true),
    closePurchase: () => setPurchasing(false),
    canRecordPurchase: state.shoppingItems.some((item) => !item.expenseId),
  };
}
