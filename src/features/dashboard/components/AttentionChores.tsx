import { selectAttentionChores } from "../utils/attentionChores";
import { dueLabel } from "../../../shared/utils/dates";
import { ListChecks } from "lucide-react";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { Link } from "react-router-dom";
import { useToday } from "../../../shared/hooks/useToday";
import { useAction } from "../../../shared/hooks/useAction";

function AttentionChores() {
  const { state, commit } = useHousehold();
  const { chores } = state;
  const today = useToday();
  const { error, perform } = useAction();
  const entries = selectAttentionChores(chores, today).slice(0, 3);
  return (
    <section
      aria-labelledby="attention-heading"
      className="relative overflow-hidden rounded-[28px] border border-[var(--roomie-card-border)] bg-white/90 p-4 shadow-[0_8px_32px_rgba(109,91,180,0.04)]"
    >
      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#CDEBFF]/40 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#7973A5]">Chores</p>
          <h2
            id="attention-heading"
            className="mt-1 text-base font-bold text-[#141326]"
          >
            Needs your attention
          </h2>
        </div>
        <Link
          to="/chores"
          aria-label="View all chores"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DDF2FF]"
        >
          <ListChecks size={17} className="text-[#5796C5]" />
        </Link>
      </div>
      {error && (
        <p role="alert" className="form-error mt-3">
          {error}
        </p>
      )}
      <div className="relative mt-3 space-y-2">
        {entries.length === 0 && (
          <p className="text-sm text-[#69608D]">
            No overdue tasks or tasks due today.
          </p>
        )}
        {entries.map((chore) => (
          <div
            key={chore.id}
            className="group flex items-center gap-3 rounded-2xl border border-[var(--roomie-card-border)] bg-white/75 p-2.5 transition-all duration-300 hover:bg-white hover:shadow-sm"
          >
            <button
              type="button"
              aria-label={`Mark ${chore.title} as completed`}
              onClick={() =>
                perform(() =>
                  commit({
                    type: "chore.status",
                    id: chore.id,
                    status: "completed",
                  }),
                )
              }
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#C8C8CF] transition-all duration-300 hover:border-[#A38CFF] hover:bg-[#F1ECFF]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#282443]">
                {chore.title}
              </p>
              <p className="mt-0.5 text-[11px] text-[#69608D]">
                {chore.assignedTo} &#183; {dueLabel(chore.dueDate, today)}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                chore.dueDate < today
                  ? "bg-[#FCE1E8] text-[#A63C60]"
                  : chore.status === "in-progress"
                    ? "bg-[#F0E9FF] text-[#8246FF]"
                    : "bg-[#FCE1E8] text-[#C77991]"
              }`}
            >
              {chore.dueDate < today ? "Overdue" : "Today"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AttentionChores;
