import { useHousehold } from "../../household/hooks/HouseholdContext";
import { calculateBalance } from "../../expenses/utils/calculations";

export function useMembers() {
  const { state } = useHousehold();
  return {
    householdName: state.name,
    currentUser: state.currentUser,
    entries: state.members.map((member) => ({
      member,
      balance: calculateBalance(state.expenses, member.name, state.settlements),
    })),
  };
}
