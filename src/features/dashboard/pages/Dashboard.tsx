import DashboardActions from "../components/DashboardActions";
import DashboardHeader from "../components/DashboardHeader";
import DashboardSummary from "../components/DashboardSummary";
import SpendingOverview from "../components/SpendingOverview";
import RecentExpenses from "../components/RecentExpenses";
import NeedsAttention from "../components/NeedsAttention";
import TasksToday from "../components/TasksToday";
import ShoppingNeeded from "../components/ShoppingNeeded";
import SpendingCategories from "../components/SpendingCategories";

function Dashboard() {
  return (
    <div className="dashboard-page space-y-5">
      <DashboardHeader />
      <DashboardActions />
      <DashboardSummary />
      <div className="dashboard-actions-grid">
        <NeedsAttention />
        <div className="dashboard-personal-panels">
          <TasksToday />
          <ShoppingNeeded />
        </div>
      </div>
      <SpendingOverview />
      <div className="dashboard-bottom-grid">
        <RecentExpenses />
        <SpendingCategories />
      </div>
    </div>
  );
}

export default Dashboard;
