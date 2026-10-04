import type { HouseholdState } from "../../../shared/types";
import { householdReducer } from "./household.ts";
import type { HouseholdAction } from "./household.ts";

export function actionLabel(action: HouseholdAction): string {
  switch (action.type) {
    case "expense.save":
      return "Expense saved";
    case "expense.delete":
      return "Expense deleted";
    case "bill.add":
      return "Bill added";
    case "bill.pay":
      return "Bill payment recorded";
    case "chore.add":
      return "Chore added";
    case "chore.status":
      return action.status === "completed"
        ? "Chore completed"
        : "Chore status updated";
    case "chore.swap.request":
      return "Chore swap requested";
    case "chore.swap.respond":
      return action.accepted ? "Chore swap accepted" : "Chore swap declined";
    case "shopping.add":
      return "Shopping item added";
    case "shopping.toggle":
      return "Shopping item updated";
    case "shopping.delete":
      return "Shopping item deleted";
    case "shopping.purchase":
      return "Shopping purchase recorded";
    case "member.add":
      return "Member added";
    case "member.delete":
      return "Member deleted";
    case "member.archive":
      return "Member archived";
    case "member.restore":
      return "Member restored";
    case "budget.save":
      return "Monthly budget saved";
    case "household.settings":
      return "Household settings saved";
    case "household.debtMode":
      return "Debt simplification updated";
    case "household.demo":
      return "Demo household loaded";
    case "settlement.add":
      return "Repayment recorded";
  }
}

export function createHouseholdHistory(
  initial: HouseholdState,
  persist: (state: HouseholdState) => void,
) {
  let state = initial;
  let previous: { state: HouseholdState; label: string } | null = null;
  const serialize = (value: HouseholdState) =>
    JSON.stringify(value, (_key, entry) =>
      entry && typeof entry === "object" && !Array.isArray(entry)
        ? Object.fromEntries(
            Object.entries(entry).sort(([first], [second]) =>
              first.localeCompare(second),
            ),
          )
        : entry,
    );
  return {
    get state() {
      return state;
    },
    get lastAction() {
      return previous?.label ?? null;
    },
    commit(action: HouseholdAction) {
      const next = householdReducer(state, action);
      if (next === state || serialize(next) === serialize(state)) return state;
      persist(next);
      previous = { state, label: actionLabel(action) };
      state = next;
      return state;
    },
    undo() {
      if (!previous) return state;
      const restored = previous.state;
      persist(restored);
      state = restored;
      previous = null;
      return state;
    },
    synchronize(next: HouseholdState) {
      state = next;
      previous = null;
    },
  };
}
