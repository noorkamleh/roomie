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
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import {
  calculateYouAreOwed,
  calculateYouOwe,
} from "../../expenses/utils/calculations";
import {
  calculateMonthlySpending,
  selectPersonalOpenChores,
} from "../utils/overview";

function DashboardSummary() {
  const { t } = usePreferences();
  const { state } = useHousehold();
  const { expenses, chores, currentUser, settlements } = state;
  const today = useToday();
  const monthly = calculateMonthlySpending(expenses, currentUser, today);
  const pendingChores = selectPersonalOpenChores(chores, currentUser).length;
  const youAreOwed = calculateYouAreOwed(expenses, currentUser, settlements);
  const youOwe = calculateYouOwe(expenses, currentUser, settlements);
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title={t("Total Expenses")}
        value={formatCurrency(monthly.total)}
        description={t("Household total this month")}
        detail={t("Your share: {amount}", {
          amount: formatCurrency(monthly.yourShare),
        })}
        icon={WalletCards}
        tone="purple"
      />
      <SummaryCard
        title={t("You are owed")}
        value={formatCurrency(youAreOwed)}
        description={t("Your remaining balance to receive")}
        icon={ArrowDownLeft}
        tone="mint"
      />
      <SummaryCard
        title={t("You owe")}
        value={formatCurrency(youOwe)}
        description={t("Your remaining balance to pay")}
        icon={ArrowUpRight}
        tone="pink"
      />
      <SummaryCard
        title={t("Pending Tasks")}
        value={String(pendingChores)}
        description={t("Open tasks assigned to {name}", { name: currentUser })}
        icon={ListChecks}
        tone="blue"
      />
    </div>
  );
}

export default DashboardSummary;
