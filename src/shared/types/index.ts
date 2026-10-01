export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  participants: string[];
  category: string;
  date: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid";
}

export interface Chore {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  completed: boolean;
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
}

export interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
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
}
