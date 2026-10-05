import { useState } from "react";
import { useAction } from "../../../shared/hooks/useAction";
import { useHousehold } from "../../household/hooks/HouseholdContext";

export function useShoppingForm() {
  const { commit } = useHousehold();
  const [name, setName] = useState("");
  const [quantity, setQuantityValue] = useState("1");
  const [unit, setUnit] = useState("");
  const { error, perform } = useAction();

  function setQuantity(value: string) {
    setQuantityValue(
      value
        .replace(/[\u0660-\u0669]/g, (digit) =>
          String(digit.charCodeAt(0) - 0x0660),
        )
        .replace(/[\u06f0-\u06f9]/g, (digit) =>
          String(digit.charCodeAt(0) - 0x06f0),
        ),
    );
  }

  function addItem() {
    if (
      perform(() =>
        commit({
          type: "shopping.add",
          item: {
            id: crypto.randomUUID(),
            name: name.trim(),
            quantity: Number(quantity),
            unit: unit || undefined,
            completed: false,
          },
        }),
      )
    ) {
      setName("");
      setQuantity("1");
      setUnit("");
    }
  }

  return {
    name,
    setName,
    quantity,
    setQuantity,
    unit,
    setUnit,
    error,
    addItem,
  };
}
