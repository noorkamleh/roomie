import type {
  Expense,
  Bill,
  Chore,
  ShoppingItem,
  Member,
} from "../types"

export const members: Member[] = [
  {
    id: "1",
    name: "Noor",
    avatar: "",
  },
  {
    id: "2",
    name: "Sara",
    avatar: "",
  },
  {
    id: "3",
    name: "Reem",
    avatar: "",
  },
]

export const expenses: Expense[] = [
  {
    id: "1",
    title: "Groceries",
    amount: 120,
    paidBy: "Noor",
    participants: ["Noor", "Sara", "Reem"],
    category: "Groceries",
    date: "2026-09-28",
  },

  {
    id: "2",
    title: "Internet",
    amount: 80,
    paidBy: "Sara",
    participants: ["Noor", "Sara"],
    category: "Bills",
    date: "2026-09-27",
  },

  {
    id: "3",
    title: "Household Supplies",
    amount: 65,
    paidBy: "Reem",
    participants: ["Noor", "Sara", "Reem"],
    category: "Household",
    date: "2026-09-26",
  },

  {
    id: "4",
    title: "Dinner",
    amount: 90,
    paidBy: "Noor",
    participants: ["Noor", "Sara", "Reem"],
    category: "Food",
    date: "2026-09-25",
  },

  {
    id: "5",
    title: "Cleaning Supplies",
    amount: 45,
    paidBy: "Sara",
    participants: ["Noor", "Sara", "Reem"],
    category: "Household",
    date: "2026-09-24",
  },
]

export const bills: Bill[] = [
  {
    id: "1",
    title: "Electricity",
    amount: 240,
    dueDate: "2026-10-05",
    status: "pending",
  },

  {
    id: "2",
    title: "Internet",
    amount: 80,
    dueDate: "2026-10-08",
    status: "pending",
  },

  {
    id: "3",
    title: "Water",
    amount: 45,
    dueDate: "2026-10-12",
    status: "pending",
  },

  {
    id: "4",
    title: "Electricity - Previous",
    amount: 210,
    dueDate: "2026-09-05",
    status: "paid",
  },
]

export const chores: Chore[] = [
  {
    id: "1",
    title: "Clean Kitchen",
    assignedTo: "Sara",
    dueDate: "2026-09-29",
    status: "pending",
  },

  {
    id: "2",
    title: "Take Out Trash",
    assignedTo: "Noor",
    dueDate: "2026-09-29",
    status: "in-progress",
  },

  {
    id: "3",
    title: "Clean Living Room",
    assignedTo: "Reem",
    dueDate: "2026-09-30",
    status: "pending",
  },

  {
    id: "4",
    title: "Wash Dishes",
    assignedTo: "Sara",
    dueDate: "2026-09-28",
    status: "completed",
  },

  {
    id: "5",
    title: "Clean Bathroom",
    assignedTo: "Noor",
    dueDate: "2026-10-01",
    status: "pending",
  },
]

export const shoppingItems: ShoppingItem[] = [
  {
    id: "1",
    name: "Milk",
    quantity: 2,
    completed: false,
  },

  {
    id: "2",
    name: "Bread",
    quantity: 1,
    completed: true,
  },

  {
    id: "3",
    name: "Eggs",
    quantity: 12,
    completed: false,
  },

  {
    id: "4",
    name: "Laundry Detergent",
    quantity: 1,
    completed: false,
  },

  {
    id: "5",
    name: "Coffee",
    quantity: 1,
    completed: true,
  },
]