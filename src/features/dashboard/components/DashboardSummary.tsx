import {
  WalletCards,
  ArrowDownLeft,
  ArrowUpRight,
  ListChecks,
} from "lucide-react";
import SummaryCard from "./SummaryCard";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useToday } from "../../../shared/hooks/useToday";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import {
  calculateTotalExpenses,
  calculateYouAreOwed,
  calculateYouOwe,
} from "../../expenses/utils/calculations";
import { calculatePendingChores } from "../../chores/utils/calculations";

function DashboardSummary() {
  const { state } = useHousehold();
  const { expenses, chores, currentUser, settlements } = state;
  const today = useToday();
  const totalExpenses = calculateTotalExpenses(
    expenses.filter(
      (expense) =>
        expense.date.startsWith(today.slice(0, 7)) && expense.date <= today,
    ),
  );
  const pendingChores = calculatePendingChores(chores);
  const youAreOwed = calculateYouAreOwed(expenses, currentUser, settlements);
  const youOwe = calculateYouOwe(expenses, currentUser, settlements);
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses)}
        description="Spent this month"
        icon={WalletCards}
        tone="purple"
      />
      <SummaryCard
        title="You are owed"
        value={formatCurrency(youAreOwed)}
        description="From your roommates"
        icon={ArrowDownLeft}
        tone="mint"
      />
      <SummaryCard
        title="You owe"
        value={formatCurrency(youOwe)}
        description="To your roommates"
        icon={ArrowUpRight}
        tone="pink"
      />
      <SummaryCard
        title="Pending Tasks"
        value={String(pendingChores)}
        description="Tasks need attention"
        icon={ListChecks}
        tone="blue"
      />
    </div>
  );
}

export default DashboardSummary;
