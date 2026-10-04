import type {
  HouseholdState,
  Expense,
  Bill,
  Chore,
  ShoppingItem,
  Member,
  Settlement,
  MonthlyBudget,
} from "../../../shared/types";
import { isBudget, isDate, isHousehold } from "./validation.ts";
import { classifyUtility } from "../../../shared/utils/classifyUtility.ts";
import { repaymentLimit } from "../../members/utils/repayments.ts";
import { nextOccurrence } from "../../chores/utils/recurrence.ts";
import {
  getAmountCents,
  withAmountCents,
} from "../../../shared/utils/money.ts";
import { localDate } from "../../../shared/utils/dates.ts";
import { nextBillOccurrence } from "../../bills/utils/recurrence.ts";

export type HouseholdAction =
  | { type: "expense.save"; expense: Expense }
  | { type: "expense.delete"; id: string }
  | { type: "bill.add"; bill: Bill }
  | { type: "bill.pay"; id: string; expense: Expense }
  | { type: "chore.add"; chore: Chore }
  | {
      type: "chore.status";
      id: string;
      status: Chore["status"];
      completedBy?: string;
      date?: string;
    }
  | {
      type: "chore.swap.request";
      id: string;
      to: string;
      requestedBy: string;
      date: string;
    }
  | {
      type: "chore.swap.respond";
      id: string;
      accepted: boolean;
      respondedBy: string;
      date: string;
    }
  | { type: "shopping.add"; item: ShoppingItem }
  | { type: "shopping.toggle"; id: string }
  | { type: "shopping.delete"; id: string }
  | { type: "shopping.purchase"; itemIds: string[]; expense: Expense }
  | { type: "member.add"; member: Member }
  | { type: "member.delete"; id: string }
  | { type: "member.archive"; id: string }
  | { type: "member.restore"; id: string }
  | { type: "budget.save"; budget: MonthlyBudget }
  | { type: "household.demo"; state: HouseholdState }
  | { type: "household.settings"; name: string; currentUser: string }
  | { type: "household.debtMode"; enabled: boolean }
  | { type: "settlement.add"; settlement: Settlement };

export function householdReducer(
  state: HouseholdState,
  action: HouseholdAction,
): HouseholdState {
  let next = state;
  const activeMembers = state.members.filter((member) => !member.archived);
  const activeNames = activeMembers.map((member) => member.name);
  function requireActiveExpense(expense: Expense, previous?: Expense) {
    const historical = previous
      ? [previous.paidBy, ...previous.participants]
      : [];
    if (
      [expense.paidBy, ...expense.participants].some(
        (name) => !activeNames.includes(name) && !historical.includes(name),
      )
    )
      throw new Error(
        "Choose active members for new expense shares, or restore the archived member first.",
      );
  }
  function activeRotation(chore: Chore) {
    if (!chore.recurrence) return undefined;
    const rotation = chore.recurrence.rotation.filter((name) =>
      activeNames.includes(name),
    );
    return {
      ...chore.recurrence,
      rotation: rotation.length > 0 ? rotation : [state.currentUser],
    };
  }
  switch (action.type) {
    case "expense.save": {
      const billExpense = state.bills.some(
        (bill) => action.expense.id === `bill-${bill.id}`,
      );
      if (billExpense)
        throw new Error("Paid bill expenses cannot be edited separately.");
      requireActiveExpense(
        action.expense,
        state.expenses.find((item) => item.id === action.expense.id),
      );
      next = {
        ...state,
        expenses: [
          {
            ...withAmountCents(action.expense),
            shoppingItems: state.expenses.find(
              (item) => item.id === action.expense.id,
            )?.shoppingItems,
            utilityKind:
              action.expense.category === "Bills"
                ? classifyUtility(action.expense.title)
                : undefined,
          },
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
        shoppingItems: state.shoppingItems.map((item) =>
          item.expenseId === action.id
            ? { ...item, expenseId: undefined }
            : item,
        ),
      };
      break;
    case "bill.add":
      next = {
        ...state,
        bills: [
          {
            ...withAmountCents(action.bill),
            ...(action.bill.recurrence
              ? {
                  seriesId: action.bill.id,
                  recurrence: {
                    ...action.bill.recurrence,
                    anchorDay: Number(action.bill.dueDate.slice(8)),
                  },
                }
              : {}),
            utilityKind: classifyUtility(action.bill.title),
          },
          ...state.bills,
        ],
      };
      break;
    case "bill.pay": {
      const bill = state.bills.find((item) => item.id === action.id);
      if (!bill || bill.status === "paid") return state;
      requireActiveExpense(action.expense);
      const expense = {
        ...action.expense,
        id: `bill-${bill.id}`,
        title: bill.title,
        amount: bill.amount,
        amountCents: getAmountCents(bill),
        category: "Bills",
        utilityKind: bill.utilityKind ?? classifyUtility(bill.title),
      };
      const upcoming = nextBillOccurrence({ ...bill, status: "paid" });
      next = {
        ...state,
        bills: [
          ...(upcoming && !state.bills.some((item) => item.id === upcoming.id)
            ? [upcoming]
            : []),
          ...state.bills.map((item) =>
            item.id === bill.id ? { ...item, status: "paid" as const } : item,
          ),
        ],
        expenses: [expense, ...state.expenses],
      };
      break;
    }
    case "chore.add": {
      if (
        !activeNames.includes(action.chore.assignedTo) ||
        action.chore.recurrence?.rotation.some(
          (name) => !activeNames.includes(name),
        )
      )
        throw new Error("Assign new chores and rotations to active members.");
      const chore = action.chore.recurrence
        ? {
            ...action.chore,
            seriesId: action.chore.id,
            recurrence: {
              ...action.chore.recurrence,
              anchorDay: Number(action.chore.dueDate.slice(8)),
            },
          }
        : action.chore;
      next = { ...state, chores: [chore, ...state.chores] };
      break;
    }
    case "chore.status": {
      const chore = state.chores.find((item) => item.id === action.id);
      if (!chore || chore.status === action.status) return state;
      const completedBy = action.completedBy ?? state.currentUser;
      if (action.status === "completed" && !activeNames.includes(completedBy))
        throw new Error("Choose an active member to complete this chore.");
      const date = action.date ?? localDate();
      const updated: Chore = {
        ...chore,
        status: action.status,
        assignedTo:
          action.status !== "completed" &&
          !activeNames.includes(chore.assignedTo)
            ? state.currentUser
            : chore.assignedTo,
        recurrence:
          action.status !== "completed"
            ? activeRotation(chore)
            : chore.recurrence,
        completedBy: action.status === "completed" ? completedBy : undefined,
        completedOn: action.status === "completed" ? date : undefined,
        completionHistory:
          action.status === "completed"
            ? [...(chore.completionHistory ?? []), { by: completedBy, date }]
            : chore.completionHistory,
        swapRequest:
          action.status === "completed" ? undefined : chore.swapRequest,
      };
      const upcoming = nextOccurrence(updated, activeMembers);
      next = {
        ...state,
        chores: [
          ...(upcoming && !state.chores.some((item) => item.id === upcoming.id)
            ? [upcoming]
            : []),
          ...state.chores.map((item) =>
            item.id === action.id ? updated : item,
          ),
        ],
      };
      break;
    }
    case "chore.swap.request": {
      const chore = state.chores.find((item) => item.id === action.id);
      if (!chore || chore.status === "completed" || chore.swapRequest)
        throw new Error("This task cannot receive another swap request.");
      if (
        chore.assignedTo !== action.requestedBy ||
        action.requestedBy !== state.currentUser ||
        action.to === chore.assignedTo ||
        !activeNames.includes(action.to)
      )
        throw new Error(
          "Only the assigned member can request a swap with another member.",
        );
      next = {
        ...state,
        chores: state.chores.map((item) =>
          item.id === action.id
            ? {
                ...item,
                swapRequest: {
                  requestedBy: action.requestedBy,
                  requestedTo: action.to,
                  requestedOn: action.date,
                },
              }
            : item,
        ),
      };
      break;
    }
    case "chore.swap.respond": {
      const chore = state.chores.find((item) => item.id === action.id);
      const request = chore?.swapRequest;
      if (
        !chore ||
        !request ||
        chore.status === "completed" ||
        request.requestedTo !== action.respondedBy ||
        action.respondedBy !== state.currentUser ||
        !isDate(action.date)
      )
        throw new Error("Only the requested member can respond to this swap.");
      next = {
        ...state,
        chores: state.chores.map((item) =>
          item.id === action.id
            ? {
                ...item,
                assignedTo: action.accepted
                  ? action.respondedBy
                  : item.assignedTo,
                swapRequest: undefined,
                swapHistory: action.accepted
                  ? [
                      ...(item.swapHistory ?? []),
                      {
                        from: item.assignedTo,
                        to: action.respondedBy,
                        requestedBy: request.requestedBy,
                        date: action.date,
                      },
                    ]
                  : item.swapHistory,
              }
            : item,
        ),
      };
      break;
    }
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
    case "shopping.purchase": {
      requireActiveExpense(action.expense);
      const items = state.shoppingItems.filter((item) =>
        action.itemIds.includes(item.id),
      );
      if (
        items.length === 0 ||
        new Set(action.itemIds).size !== action.itemIds.length ||
        items.length !== action.itemIds.length ||
        items.some((item) => item.expenseId)
      )
        throw new Error(
          "Choose unrecorded shopping items. Some items may already have a recorded cost.",
        );
      if (state.expenses.some((item) => item.id === action.expense.id))
        throw new Error("This shopping purchase has already been recorded.");
      const expense: Expense = {
        ...withAmountCents(action.expense),
        shoppingItems: items.map(({ id, name, quantity, unit }) => ({
          id,
          name,
          quantity,
          ...(unit ? { unit } : {}),
        })),
      };
      next = {
        ...state,
        expenses: [expense, ...state.expenses],
        shoppingItems: state.shoppingItems.map((item) =>
          action.itemIds.includes(item.id)
            ? { ...item, completed: true, expenseId: expense.id }
            : item,
        ),
      };
      break;
    }
    case "member.add":
      next = { ...state, members: [...state.members, action.member] };
      break;
    case "member.archive": {
      const member = state.members.find((item) => item.id === action.id);
      if (!member || member.archived) return state;
      if (activeMembers.length <= 1)
        throw new Error("Keep at least one active household member.");
      const remaining = activeMembers.filter((item) => item.id !== member.id);
      const fallback =
        state.currentUser === member.name
          ? remaining[0].name
          : state.currentUser;
      const remainingNames = remaining.map((item) => item.name);
      next = {
        ...state,
        members: state.members.map((item) =>
          item.id === member.id ? { ...item, archived: true } : item,
        ),
        currentUser: fallback,
        chores: state.chores.map((chore) => {
          if (chore.status === "completed") return chore;
          const rotation = chore.recurrence?.rotation.filter((name) =>
            remainingNames.includes(name),
          );
          return {
            ...chore,
            assignedTo:
              chore.assignedTo === member.name ? fallback : chore.assignedTo,
            recurrence: chore.recurrence
              ? {
                  ...chore.recurrence,
                  rotation:
                    rotation && rotation.length > 0 ? rotation : [fallback],
                }
              : undefined,
            swapRequest:
              chore.swapRequest?.requestedBy === member.name ||
              chore.swapRequest?.requestedTo === member.name
                ? undefined
                : chore.swapRequest,
          };
        }),
      };
      break;
    }
    case "member.restore": {
      const member = state.members.find((item) => item.id === action.id);
      if (!member || !member.archived) return state;
      next = {
        ...state,
        members: state.members.map((item) =>
          item.id === action.id ? { ...item, archived: false } : item,
        ),
      };
      break;
    }
    case "member.delete": {
      const member = state.members.find((item) => item.id === action.id);
      if (!member) return state;
      if (!member.archived && activeMembers.length <= 1)
        throw new Error(
          "Add another member before deleting the last household member.",
        );
      if (state.expenses.some((expense) => expense.paidBy === member.name))
        throw new Error(
          "Update expenses paid by this member before deleting them.",
        );
      if (
        state.expenses.some((expense) =>
          expense.participants.includes(member.name),
        )
      )
        throw new Error(
          "Remove this member from expense participants before deleting them.",
        );
      if (
        state.settlements.some(
          (settlement) =>
            settlement.from === member.name || settlement.to === member.name,
        )
      )
        throw new Error(
          "This member has recorded payments. Keep them to preserve payment history.",
        );
      if (
        state.chores.some(
          (chore) =>
            chore.assignedTo === member.name ||
            chore.recurrence?.rotation.includes(member.name) ||
            chore.completedBy === member.name ||
            chore.completionHistory?.some(
              (entry) => entry.by === member.name,
            ) ||
            chore.swapRequest?.requestedBy === member.name ||
            chore.swapRequest?.requestedTo === member.name ||
            chore.swapHistory?.some(
              (entry) =>
                entry.from === member.name ||
                entry.to === member.name ||
                entry.requestedBy === member.name,
            ),
        )
      )
        throw new Error(
          "This member has assigned chores and cannot be deleted.",
        );
      const members = state.members.filter((item) => item.id !== action.id);
      next = {
        ...state,
        members,
        currentUser:
          state.currentUser === member.name
            ? members.find((item) => !item.archived)!.name
            : state.currentUser,
      };
      break;
    }
    case "household.settings":
      if (!activeNames.includes(action.currentUser))
        throw new Error("Choose an active member for the current view.");
      next = { ...state, name: action.name, currentUser: action.currentUser };
      break;
    case "budget.save":
      if (!isBudget(action.budget))
        throw new Error(
          "Choose a valid month and nonnegative budget amounts with two decimal places.",
        );
      next = {
        ...state,
        budgets: [
          ...(state.budgets ?? []).filter(
            (budget) => budget.month !== action.budget.month,
          ),
          { ...action.budget, categories: { ...action.budget.categories } },
        ].sort((first, second) => first.month.localeCompare(second.month)),
      };
      break;
    case "household.demo":
      next = action.state;
      break;
    case "household.debtMode":
      if ((state.simplifyDebts !== false) === action.enabled) return state;
      next = { ...state, simplifyDebts: action.enabled };
      break;
    case "settlement.add": {
      const limit = repaymentLimit(
        state,
        action.settlement.from,
        action.settlement.to,
      );
      if (
        limit <= 0 ||
        Math.round(action.settlement.amount * 100) > Math.round(limit * 100)
      )
        throw new Error(
          "This payment exceeds the outstanding balance. Refresh the suggested payments.",
        );
      next = {
        ...state,
        settlements: [...state.settlements, withAmountCents(action.settlement)],
      };
      break;
    }
  }
  if (!isHousehold(next))
    throw new Error("Check the amount, date, members and required fields.");
  return next;
}
