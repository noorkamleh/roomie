export interface Expense {
  id: string
  title: string
  amount: number
  paidBy: string
  participants: string[]
  category: string
  date: string
}

export interface Bill {
  id: string
  title: string
  amount: number
  dueDate: string
  status: "pending" | "paid"
}

export interface Chore {
  id: string
  title: string
  assignedTo: string
  dueDate: string
  status: "pending" | "in-progress" | "completed"
}

export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  completed: boolean
}

export interface Member {
  id: string
  name: string
  avatar?: string
}