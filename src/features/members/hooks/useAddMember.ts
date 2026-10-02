import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";

export function useAddMember() {
  const { state, commit } = useHousehold();
  const [name, setName] = useState("");
  const { error, perform } = useAction();
  function add() {
    if (
      perform(() => {
        if (
          state.members.some(
            (member) => member.name.toLowerCase() === name.trim().toLowerCase(),
          )
        ) {
          throw new Error("A member with this name already exists.");
        }
        commit({
          type: "member.add",
          member: { id: crypto.randomUUID(), name: name.trim(), avatar: "" },
        });
      })
    )
      setName("");
  }
  return { name, setName, error, add };
}
