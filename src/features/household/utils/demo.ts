import type { HouseholdState } from "../../../shared/types";
import { localDate } from "../../../shared/utils/dates.ts";

export function demoHousehold(now = new Date()): HouseholdState {
  const today = localDate(now);
  const month = today.slice(0, 7);
  const date = (offset: number) => {
    const day = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
    );
    return localDate(day);
  };
  const members = [
    { id: "demo-noor", name: "Noor" },
    { id: "demo-sara", name: "Sara" },
    { id: "demo-reem", name: "Reem" },
  ];
  const expenses = [
    {
      title: "Weekly groceries",
      amount: 185.75,
      paidBy: "Noor",
      category: "Groceries",
      offset: 0,
    },
    {
      title: "Fruit and vegetables",
      amount: 58.5,
      paidBy: "Sara",
      category: "Groceries",
      offset: -1,
    },
    {
      title: "Internet",
      amount: 80,
      paidBy: "Sara",
      category: "Bills",
      offset: -2,
    },
    {
      title: "Shared dinner",
      amount: 96,
      paidBy: "Reem",
      category: "Food",
      offset: -2,
    },
    {
      title: "Cleaning supplies",
      amount: 42.25,
      paidBy: "Noor",
      category: "Household",
      offset: -3,
    },
    {
      title: "Coffee and breakfast",
      amount: 64,
      paidBy: "Sara",
      category: "Food",
      offset: -5,
    },
    {
      title: "Kitchen essentials",
      amount: 115,
      paidBy: "Reem",
      category: "Household",
      offset: -8,
    },
    {
      title: "Last month groceries",
      amount: 168,
      paidBy: "Noor",
      category: "Groceries",
      offset: -now.getDate(),
    },
  ].map((entry, index) => ({
    id:
      entry.title === "Internet"
        ? "bill-demo-internet"
        : `demo-expense-${index}`,
    title: entry.title,
    amount: entry.amount,
    amountCents: Math.round(entry.amount * 100),
    paidBy: entry.paidBy,
    participants: members.map((member) => member.name),
    category: entry.category,
    date: date(entry.offset),
  }));
  return {
    version: 1,
    name: "The Garden House",
    currentUser: "Noor",
    members,
    expenses,
    bills: [
      {
        id: "demo-electricity",
        title: "Electricity",
        amount: 240,
        amountCents: 24000,
        dueDate: date(2),
        status: "pending",
        utilityKind: "electricity",
        recurrence: {
          frequency: "monthly",
          anchorDay: Number(date(2).slice(8)),
        },
        seriesId: "demo-electricity",
      },
      {
        id: "demo-water",
        title: "Water",
        amount: 45,
        amountCents: 4500,
        dueDate: date(-1),
        status: "pending",
        utilityKind: "water",
      },
      {
        id: "demo-internet",
        title: "Internet",
        amount: 80,
        amountCents: 8000,
        dueDate: date(-2),
        status: "paid",
        utilityKind: "internet",
      },
    ],
    chores: [
      {
        id: "demo-kitchen",
        title: "Clean kitchen",
        assignedTo: "Noor",
        dueDate: today,
        status: "pending",
        seriesId: "demo-kitchen",
        recurrence: { frequency: "weekly", rotation: ["Noor", "Sara", "Reem"] },
      },
      {
        id: "demo-trash",
        title: "Take out recycling",
        assignedTo: "Sara",
        dueDate: date(-1),
        status: "in-progress",
      },
      {
        id: "demo-bathroom",
        title: "Clean bathroom",
        assignedTo: "Reem",
        dueDate: date(2),
        status: "pending",
        seriesId: "demo-bathroom",
        recurrence: {
          frequency: "monthly",
          rotation: ["Reem", "Noor", "Sara"],
          anchorDay: Number(date(2).slice(8)),
        },
      },
      {
        id: "demo-dishes",
        title: "Wash dishes",
        assignedTo: "Noor",
        dueDate: date(-1),
        status: "completed",
        completedBy: "Noor",
        completedOn: date(-1),
        completionHistory: [{ by: "Noor", date: date(-1) }],
      },
    ],
    shoppingItems: [
      {
        id: "demo-milk",
        name: "Milk",
        quantity: 2,
        unit: "L",
        completed: false,
      },
      {
        id: "demo-eggs",
        name: "Eggs",
        quantity: 12,
        unit: "pc",
        completed: false,
      },
      {
        id: "demo-rice",
        name: "Rice",
        quantity: 5,
        unit: "kg",
        completed: false,
      },
      {
        id: "demo-bread",
        name: "Bread",
        quantity: 2,
        unit: "pack",
        completed: true,
      },
    ],
    settlements: [
      {
        id: "demo-payment",
        from: "Sara",
        to: "Noor",
        amount: 10,
        amountCents: 1000,
        date: date(-1),
      },
    ],
    simplifyDebts: true,
    budgets: [
      {
        month,
        totalCents: 150000,
        categories: { Groceries: 60000, Food: 30000, Bills: 40000 },
      },
    ],
  };
}
