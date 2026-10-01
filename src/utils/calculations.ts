import type { Expense, Chore, } from "../types"
export function calculateTotalExpenses( expenses: Expense[] ) { return expenses.reduce((total, expense) => { return total + expense.amount }, 0) }
export function calculatePendingChores( chores: Chore[] ) { return chores.filter( (chore) => chore.status !== "completed" ).length }
export function calculateBalance( expenses: Expense[], currentUser: string ) { let balance = 0
expenses.forEach((expense) => { if (!expense.participants.includes(currentUser)) { return }
const share =
  expense.amount / expense.participants.length

if (expense.paidBy === currentUser) {
  balance += expense.amount - share
} else {
  balance -= share
}
})
return balance }
export function calculateYouAreOwed( expenses: Expense[], currentUser: string ) { const balance = calculateBalance(expenses, currentUser)
return Math.max(balance, 0) }
export function calculateYouOwe( expenses: Expense[], currentUser: string ) { const balance = calculateBalance(expenses, currentUser)
return Math.max(-balance, 0) }