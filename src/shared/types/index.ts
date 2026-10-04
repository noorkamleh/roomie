export type UtilityKind = "electricity" | "internet" | "water";

export type ExpenseSplit =
  | { mode: "amounts"; sharesCents: Record<string, number> }
  | { mode: "percentages"; basisPoints: Record<string, number> };

export interface Expense {
  id: string;
  title: string;
  amount: number;
  amountCents?: number;
  paidBy: string;
  participants: string[];
  category: string;
  utilityKind?: UtilityKind;
  date: string;
  split?: ExpenseSplit;
  shoppingItems?: {
    id: string;
    name: string;
    quantity: number;
    unit?: string;
  }[];
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  amountCents?: number;
  dueDate: string;
  status: "pending" | "paid";
  utilityKind?: UtilityKind;
  recurrence?: { frequency: "monthly"; anchorDay?: number };
  seriesId?: string;
}

export interface Chore {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  recurrence?: {
    frequency: "weekly" | "monthly";
    rotation: string[];
    anchorDay?: number;
  };
  seriesId?: string;
  completedBy?: string;
  completedOn?: string;
  completionHistory?: { by: string; date: string }[];
  swapRequest?: {
    requestedBy: string;
    requestedTo: string;
    requestedOn: string;
  };
  swapHistory?: {
    from: string;
    to: string;
    requestedBy: string;
    date: string;
  }[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  completed: boolean;
  expenseId?: string;
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  archived?: boolean;
}

export interface MonthlyBudget {
  month: string;
  totalCents: number;
  categories: Record<string, number>;
}

export interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
  amountCents?: number;
  date: string;
}

export interface HouseholdState {
  version: 1;
  name: string;
  currentUser: string;
  members: Member[];
  expenses: Expense[];
  bills: Bill[];
  chores: Chore[];
  shoppingItems: ShoppingItem[];
  settlements: Settlement[];
  simplifyDebts?: boolean;
  budgets?: MonthlyBudget[];
}
