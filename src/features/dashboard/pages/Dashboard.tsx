import DashboardActions from "../components/DashboardActions";
import DashboardHeader from "../components/DashboardHeader";
import DashboardSummary from "../components/DashboardSummary";
import SpendingOverview from "../components/SpendingOverview";
import UpcomingBills from "../components/UpcomingBills";
import RecentExpenses from "../components/RecentExpenses";
import TodaysChores from "../components/TodaysChores";

function Dashboard() {
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardActions />
      <DashboardSummary />
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <SpendingOverview />
        <UpcomingBills />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <RecentExpenses />
        <TodaysChores />
      </div>
    </div>
  );
}

export default Dashboard;
