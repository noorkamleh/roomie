import { useHousehold } from "../../household/hooks/HouseholdContext";
import { calculateBalance } from "../../expenses/utils/calculations";
import { useAction } from "../../../shared/hooks/useAction";
import type { Member } from "../../../shared/types";
import { useConfirmation } from "../../../shared/confirmation/ConfirmationContext";

export function useMembers() {
  const { state, commit } = useHousehold();
  const confirm = useConfirmation();
  const { error, perform } = useAction();

  async function removeMember(member: Member) {
    if (
      await confirm({
        title: "Delete member",
        message: "Delete {name} from the household?",
        params: { name: member.name },
        confirmLabel: "Delete",
        intent: "danger",
      })
    ) {
      perform(() => commit({ type: "member.delete", id: member.id }));
    }
  }

  return {
    householdName: state.name,
    currentUser: state.currentUser,
    error,
    removeMember,
    archiveMember: async (member: Member) => {
      if (
        await confirm({
          title: "Archive member",
          message:
            "Archive {name}? Their expenses and payments will stay in your history. Open tasks will move to an active housemate.",
          params: { name: member.name },
          confirmLabel: "Archive member",
        })
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
