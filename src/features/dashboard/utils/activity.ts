import type { HouseholdState, UtilityKind } from "../../../shared/types";
import { getAmountCents } from "../../../shared/utils/money.ts";
import { formatDate } from "../../../shared/utils/dates.ts";
import { translate } from "../../../shared/preferences/i18n.ts";

export interface DashboardActivity {
  id: string;
  type: "expense" | "repayment" | "chore";
  title: string;
  detail: string;
  date: string;
  amount?: number;
  participants?: number;
  category?: string;
  utilityKind?: UtilityKind;
  to: string;
}

export function selectRecentActivity(
  state: Pick<HouseholdState, "expenses" | "settlements" | "chores">,
  today: string,
) {
  const activities: DashboardActivity[] = [
    ...state.expenses.map((expense) => ({
      id: `expense-${expense.id}`,
      type: "expense" as const,
      title: expense.title,
      detail: translate("{name} paid · {date}", {
        name: expense.paidBy,
        date: formatDate(expense.date),
      }),
      date: expense.date,
      amount: getAmountCents(expense) / 100,
      participants: expense.participants.length,
      category: expense.category,
      utilityKind: expense.utilityKind,
      to: "/expenses",
    })),
    ...state.settlements.map((settlement) => ({
      id: `repayment-${settlement.id}`,
      type: "repayment" as const,
      title: translate("{from} repaid {to}", {
        from: settlement.from,
        to: settlement.to,
      }),
      detail: translate("Recorded repayment · {date}", {
        date: formatDate(settlement.date),
      }),
      date: settlement.date,
      amount: getAmountCents(settlement) / 100,
      to: "/members",
    })),
  ];
  for (const chore of state.chores) {
    const completions = chore.completionHistory?.length
      ? chore.completionHistory
      : chore.completedOn && chore.completedBy
        ? [{ by: chore.completedBy, date: chore.completedOn }]
        : [];
    for (const [index, completion] of completions.entries()) {
      activities.push({
        id: `chore-${chore.id}-${index}`,
        type: "chore",
        title: translate("{name} completed {title}", {
          name: completion.by,
          title: chore.title,
        }),
        detail: translate("Task completed · {date}", {
          date: formatDate(completion.date),
        }),
        date: completion.date,
        to: "/chores",
      });
    }
  }
  return activities
    .filter((activity) => activity.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));
}
