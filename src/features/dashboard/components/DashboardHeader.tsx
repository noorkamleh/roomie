import { useHousehold } from "../../household/hooks/HouseholdContext";
import { CalendarDays } from "lucide-react";
import { useDashboardClock } from "../hooks/useDashboardClock";

function DashboardHeader() {
  const { state } = useHousehold();
  const { greeting, dayLabel, timeLabel } = useDashboardClock();
  return (
    <div className="dashboard-header relative flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[36px] font-bold tracking-[-0.04em] text-[#141326]">
          {greeting}, {state.currentUser}
        </h1>
        <p className="mt-2 text-[14px] font-medium text-[#7973A5]">
          Here's what's happening at {state.name} today.
        </p>
      </div>
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--roomie-card-border)] bg-white/90 px-4 py-3 text-sm font-semibold text-[#3D376D] shadow-[0_8px_24px_rgba(109,91,180,0.07)]">
        <CalendarDays size={17} strokeWidth={1.8} aria-hidden="true" />
        <div>
          <p>{dayLabel}</p>
          <p className="mt-1 text-xs font-medium text-[#69608D]">{timeLabel}</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
