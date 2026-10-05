import { useState } from "react";
import type { ExpenseSplit } from "../../../shared/types";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import { localDate } from "../../../shared/utils/dates";
import { splitExpense } from "../../expenses/utils/calculations";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

export function useShoppingPurchase() {
  const { state, commit } = useHousehold();
  const { t, currency, toDisplayAmount, toBaseAmount } = usePreferences();
  const members = state.members.filter((member) => !member.archived);
  const items = state.shoppingItems.filter((item) => !item.expenseId);
  const [itemIds, setItemIds] = useState(
    items.filter((item) => item.completed).map((item) => item.id),
  );
  const [title, setTitle] = useState(() => t("Shopping purchase"));
  const [amountDraft, setAmountDraft] = useState({
    value: "",
    currency,
    baseAmount: 0,
  });
  const baseAmount = amountDraft.baseAmount;
  const amount =
    amountDraft.currency === currency
      ? amountDraft.value
      : amountDraft.value === ""
        ? ""
        : String(toDisplayAmount(baseAmount));
  function setAmount(value: string) {
    setAmountDraft({
      value,
      currency,
      baseAmount: toBaseAmount(Number(value)),
    });
  }
  const [paidBy, setPaidBy] = useState(state.currentUser);
  const [date, setDate] = useState(localDate);
  const [participants, setParticipants] = useState(
    members.map((member) => member.name),
  );
  const [split, setSplit] = useState<ExpenseSplit | undefined>();
  const { error, perform } = useAction();
  function toggleItem(id: string, selected: boolean) {
    setItemIds((previous) =>
      selected ? [...previous, id] : previous.filter((value) => value !== id),
    );
  }
  function save() {
    return perform(() => {
      if (itemIds.length === 0)
        throw new Error("Choose at least one shopping item.");
      const expense = {
        id: crypto.randomUUID(),
        title: title.trim(),
        amount: baseAmount,
        paidBy,
        participants,
        split,
        date,
        category: "Groceries",
      };
      splitExpense(expense);
      commit({ type: "shopping.purchase", itemIds, expense });
    });
  }
  return {
    items,
    itemIds,
    toggleItem,
    title,
    setTitle,
    amount,
    baseAmount,
    setAmount,
    paidBy,
    setPaidBy,
    date,
    setDate,
    participants,
    setParticipants,
    split,
    setSplit,
    members,
    error,
    save,
  };
}
