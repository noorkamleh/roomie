import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";

export function useAddMember() {
  const { commit } = useHousehold();
  const [name, setName] = useState("");
  const { error, perform } = useAction();
  function add() {
    if (
      perform(() =>
        commit({
          type: "member.add",
          member: { id: crypto.randomUUID(), name: name.trim(), avatar: "" },
        }),
      )
    )
      setName("");
  }
  return { name, setName, error, add };
}
