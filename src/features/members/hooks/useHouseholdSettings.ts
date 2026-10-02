import { useState } from "react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";

type SettingsDraft = {
  sourceName: string;
  sourceUser: string;
  name: string;
  currentUser: string;
};

export function useHouseholdSettings() {
  const { state, commit } = useHousehold();
  const [draft, setDraft] = useState<SettingsDraft | null>(null);
  const [saved, setSaved] = useState(false);
  const { error, perform } = useAction();

  const fields =
    draft?.sourceName === state.name && draft.sourceUser === state.currentUser
      ? draft
      : {
          sourceName: state.name,
          sourceUser: state.currentUser,
          name: state.name,
          currentUser: state.currentUser,
        };
  const { name, currentUser } = fields;

  function save() {
    const success = perform(() =>
      commit({ type: "household.settings", name: name.trim(), currentUser }),
    );
    setSaved(success);
    if (success) setDraft(null);
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
      setDraft({ ...fields, name: value });
    },
    changeUser: (value: string) => {
      setSaved(false);
      setDraft({ ...fields, currentUser: value });
    },
  };
}
