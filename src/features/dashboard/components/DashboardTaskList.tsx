import type { Chore } from "../../../shared/types";
import { Check } from "lucide-react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useAction } from "../../../shared/hooks/useAction";
import { dueLabel } from "../../../shared/utils/dates";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

function DashboardTaskList({
  entries,
  today,
}: {
  entries: Chore[];
  today: string;
}) {
  const { t } = usePreferences();
  const { commit } = useHousehold();
  const { error, perform } = useAction();
  return (
    <>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <ul className="dashboard-action-list">
        {entries.map((chore) => (
          <li key={chore.id} className="dashboard-task-row">
            <div className="dashboard-row-copy">
              <p className="dashboard-row-title">{chore.title}</p>
              <p className="dashboard-row-detail">
                {chore.assignedTo} · {dueLabel(chore.dueDate, today)}
              </p>
            </div>
            <button
              type="button"
              className="dashboard-complete-button"
              aria-label={t("Mark {title} as completed (Done)", {
                title: chore.title,
              })}
              onClick={() =>
                perform(() =>
                  commit({
                    type: "chore.status",
                    id: chore.id,
                    status: "completed",
                  }),
                )
              }
            >
              <Check size={15} aria-hidden="true" />
              {t("Done")}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default DashboardTaskList;
