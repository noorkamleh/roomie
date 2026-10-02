import DashboardActions from "../components/DashboardActions";
import DashboardHeader from "../components/DashboardHeader";
import DashboardSummary from "../components/DashboardSummary";
import SpendingOverview from "../components/SpendingOverview";
import UpcomingBills from "../components/UpcomingBills";
import RecentExpenses from "../components/RecentExpenses";
import AttentionChores from "../components/AttentionChores";

function Dashboard() {
  return (
    <div className="space-y-5">
      <DashboardHeader />
      <DashboardActions />
      <DashboardSummary />
      <div className="grid items-start gap-5 xl:grid-cols-[1.65fr_1fr]">
        <SpendingOverview />
        <div className="grid gap-4 xl:col-start-2 xl:row-span-2">
          <UpcomingBills />
          <AttentionChores />
        </div>
        <div className="min-w-0 xl:col-start-1 xl:row-start-2">
          <RecentExpenses />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
