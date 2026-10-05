import { Link } from "react-router-dom";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useToday } from "../../../shared/hooks/useToday";
import { selectPersonalOpenChores } from "../utils/overview";
import DashboardTaskList from "./DashboardTaskList";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function TasksToday() {
  const { t } = usePreferences();
  const { state } = useHousehold();
  const today = useToday();
  const entries = selectPersonalOpenChores(
    state.chores,
    state.currentUser,
  ).filter((chore) => chore.dueDate === today);
  return (
    <section className="dashboard-panel" aria-labelledby="today-tasks-heading">
      <div className="dashboard-panel-heading">
        <div>
          <p className="dashboard-eyebrow">
            {t("Assigned to {name}", { name: state.currentUser })}
          </p>
          <h2 id="today-tasks-heading">{t("Your tasks today")}</h2>
        </div>
        <Link to="/chores" className="dashboard-text-link">
          {t("All your tasks")}
        </Link>
      </div>
      {entries.length === 0 ? (
        <p className="dashboard-empty">{t("No open tasks due today.")}</p>
      ) : (
        <DashboardTaskList entries={entries.slice(0, 3)} today={today} />
      )}
      {entries.length > 3 && (
        <p className="dashboard-row-detail">
          {t("{count} more tasks due today in Chores.", {
            count: entries.length - 3,
          })}
        </p>
      )}
    </section>
  );
}

export default TasksToday;
