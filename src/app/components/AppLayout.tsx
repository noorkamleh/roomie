import { useHousehold } from "../../features/household/hooks/HouseholdContext";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import UndoNotice from "../../features/household/components/UndoNotice";
import DisplayPreferences from "./DisplayPreferences";
import { usePreferences } from "../../shared/preferences/PreferencesContext";

function AppLayout({ children }: { children: ReactNode }) {
  const { t } = usePreferences();
  const { storageError } = useHousehold();
  const { pathname } = useLocation();
  return (
    <div className="roomie-app relative min-h-screen overflow-hidden bg-[color:var(--roomie-surface,#F3F5FF)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[color:var(--roomie-tint-purple,#DCD1FF)]/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-120px] top-[-80px] h-96 w-96 rounded-full bg-[color:var(--roomie-tint-blue,#DCEAFF)]/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-150px] left-[40%] h-96 w-96 rounded-full bg-[color:var(--roomie-tint-purple,#EEE6FF)]/45 blur-3xl"
      />
      <div className="relative z-10">
        <Sidebar />
        <main
          className={`roomie-main relative min-h-screen p-8 ${pathname === "/dashboard" || pathname === "/" ? "" : "roomie-main--inner"}`}
        >
          <DisplayPreferences />
          {storageError && (
            <p role="alert" className="form-error mb-4">
              {t(storageError)}
            </p>
          )}
          {children}
        </main>
        <UndoNotice />
      </div>
    </div>
  );
}

export default AppLayout;
