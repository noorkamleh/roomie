import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";

export function useHouseholdSettings() {
  const { state, commit } = useHousehold();
  const [name, setName] = useState(state.name);
  const [currentUser, setCurrentUser] = useState(state.currentUser);
  const [saved, setSaved] = useState(false);
  const { error, perform } = useAction();

  function save() {
    setSaved(
      perform(() =>
        commit({ type: "household.settings", name: name.trim(), currentUser }),
      ),
    );
  }
  return {
    name,
    currentUser,
    members: state.members,
    saved,
    error,
    save,
    changeName: (value: string) => {
      setSaved(false);
      setName(value);
    },
    changeUser: (value: string) => {
      setSaved(false);
      setCurrentUser(value);
    },
  };
}
