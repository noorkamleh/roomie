import { useState } from "react";
import { useAction } from "../../../shared/hooks/useAction";
import { useHousehold } from "../../household/hooks/HouseholdContext";

export function useShoppingForm() {
  const { commit } = useHousehold();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const { error, perform } = useAction();

  function addItem() {
    if (
      perform(() =>
        commit({
          type: "shopping.add",
          item: {
            id: crypto.randomUUID(),
            name: name.trim(),
            quantity: Number(quantity),
            completed: false,
          },
        }),
      )
    ) {
      setName("");
      setQuantity("1");
    }
  }

  return { name, setName, quantity, setQuantity, error, addItem };
}
