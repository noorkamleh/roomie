import { useHousehold } from "../../household/hooks/HouseholdContext";
import { calculateBalance } from "../../expenses/utils/calculations";
import { useAction } from "../../../shared/hooks/useAction";
import type { Member } from "../../../shared/types";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

export function useMembers() {
  const { state, commit } = useHousehold();
  const { t } = usePreferences();
  const { error, perform } = useAction();

  function removeMember(member: Member) {
    if (
      window.confirm(
        t("Delete {name} from the household?", { name: member.name }),
      )
    ) {
      perform(() => commit({ type: "member.delete", id: member.id }));
    }
  }

  return {
    householdName: state.name,
    currentUser: state.currentUser,
    error,
    removeMember,
    archiveMember: (member: Member) => {
      if (
        window.confirm(
          t(
            "Archive {name}? Their expenses and payments will stay in your history. Open tasks will move to an active housemate.",
            { name: member.name },
          ),
        )
      )
        perform(() => commit({ type: "member.archive", id: member.id }));
    },
    restoreMember: (member: Member) =>
      perform(() => commit({ type: "member.restore", id: member.id })),
    entries: state.members.map((member) => ({
      member,
      balance: calculateBalance(state.expenses, member.name, state.settlements),
    })),
  };
}
