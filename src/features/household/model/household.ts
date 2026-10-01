import type {
  HouseholdState,
  Expense,
  Bill,
  Chore,
  ShoppingItem,
  Member,
  Settlement,
} from "../../../shared/types";
import { isHousehold } from "./validation.ts";
import { suggestSettlements } from "../../expenses/utils/calculations.ts";

export type HouseholdAction =
  | { type: "expense.save"; expense: Expense }
  | { type: "expense.delete"; id: string }
  | { type: "bill.add"; bill: Bill }
  | { type: "bill.pay"; id: string; expense: Expense }
  | { type: "chore.add"; chore: Chore }
  | { type: "chore.status"; id: string; status: Chore["status"] }
  | { type: "shopping.add"; item: ShoppingItem }
  | { type: "shopping.toggle"; id: string }
  | { type: "shopping.delete"; id: string }
  | { type: "member.add"; member: Member }
  | { type: "household.settings"; name: string; currentUser: string }
  | { type: "settlement.add"; settlement: Settlement };

export function householdReducer(
  state: HouseholdState,
  action: HouseholdAction,
): HouseholdState {
  let next = state;
  switch (action.type) {
    case "expense.save": {
      const billExpense = state.bills.some(
        (bill) => action.expense.id === `bill-${bill.id}`,
      );
      if (billExpense)
        throw new Error("Paid bill expenses cannot be edited separately.");
      next = {
        ...state,
        expenses: [
          action.expense,
          ...state.expenses.filter((item) => item.id !== action.expense.id),
        ],
      };
      break;
    }
    case "expense.delete":
      if (state.bills.some((bill) => action.id === `bill-${bill.id}`))
        throw new Error("Paid bill expenses cannot be removed separately.");
      next = {
        ...state,
        expenses: state.expenses.filter((item) => item.id !== action.id),
      };
      break;
    case "bill.add":
      next = { ...state, bills: [action.bill, ...state.bills] };
      break;
    case "bill.pay": {
      const bill = state.bills.find((item) => item.id === action.id);
      if (!bill || bill.status === "paid") return state;
      const expense = {
        ...action.expense,
        id: `bill-${bill.id}`,
        title: bill.title,
        amount: bill.amount,
        category: "Bills",
      };
      next = {
        ...state,
        bills: state.bills.map((item) =>
          item.id === bill.id ? { ...item, status: "paid" } : item,
        ),
        expenses: [expense, ...state.expenses],
      };
      break;
    }
    case "chore.add":
      next = { ...state, chores: [action.chore, ...state.chores] };
      break;
    case "chore.status":
      next = {
        ...state,
        chores: state.chores.map((item) =>
          item.id === action.id ? { ...item, status: action.status } : item,
        ),
      };
      break;
    case "shopping.add":
      next = { ...state, shoppingItems: [action.item, ...state.shoppingItems] };
      break;
    case "shopping.toggle":
      next = {
        ...state,
        shoppingItems: state.shoppingItems.map((item) =>
          item.id === action.id
            ? { ...item, completed: !item.completed }
            : item,
        ),
      };
      break;
    case "shopping.delete":
      next = {
        ...state,
        shoppingItems: state.shoppingItems.filter(
          (item) => item.id !== action.id,
        ),
      };
      break;
    case "member.add":
      next = { ...state, members: [...state.members, action.member] };
      break;
    case "household.settings":
      next = { ...state, name: action.name, currentUser: action.currentUser };
      break;
    case "settlement.add": {
      const transfer = suggestSettlements(
        state.expenses,
        state.members.map((member) => member.name),
        state.settlements,
      ).find(
        (item) =>
          item.from === action.settlement.from &&
          item.to === action.settlement.to,
      );
      if (!transfer || action.settlement.amount > transfer.amount)
        throw new Error(
          "This payment exceeds the outstanding balance. Refresh the suggested payments.",
        );
      next = {
        ...state,
        settlements: [...state.settlements, action.settlement],
      };
      break;
    }
  }
  if (!isHousehold(next))
    throw new Error("Check the amount, date, members and required fields.");
  return next;
}
