import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import type { Chore } from "../../../shared/types";
import { formatDate } from "../../../shared/utils/dates";

function ChoreHistory({ chore }: { chore: Chore }) {
  const { t } = usePreferences();
  return (
    <>
      {chore.completedBy && chore.completedOn && (
        <p className="chore-completed-by">
          {t("Completed by {name} on {date}", {
            name: chore.completedBy,
            date: formatDate(chore.completedOn),
          })}
        </p>
      )}
      {!!chore.completionHistory?.length && (
        <details className="chore-history">
          <summary>
            {t("Completion history ({count})", {
              count: chore.completionHistory.length,
            })}
          </summary>
          {chore.completionHistory.map((entry, index) => (
            <p key={`${entry.date}-${index}`}>
              {t("{name} completed this chore on {date}.", {
                name: entry.by,
                date: formatDate(entry.date),
              })}
            </p>
          ))}
        </details>
      )}
      {!!chore.swapHistory?.length && (
        <details className="chore-history">
          <summary>
            {t("Swap history ({count})", { count: chore.swapHistory.length })}
          </summary>
          {chore.swapHistory.map((entry, index) => (
            <p key={`${entry.date}-${index}`}>
              {t("{from} → {to} on {date}", {
                from: entry.from,
                to: entry.to,
                date: formatDate(entry.date),
              })}
            </p>
          ))}
        </details>
      )}
    </>
  );
}

export default ChoreHistory;
