import { useHousehold } from "../../features/household/hooks/HouseholdContext";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

function AppLayout({ children }: { children: ReactNode }) {
  const { storageError } = useHousehold();
  return (
    <div className="roomie-app relative min-h-screen overflow-hidden bg-[#F3F5FF]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#DCD1FF]/45 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-120px] top-[-80px] h-96 w-96 rounded-full bg-[#DCEAFF]/50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-150px] left-[40%] h-96 w-96 rounded-full bg-[#EEE6FF]/45 blur-3xl"
      />
      <div className="relative z-10">
        <Sidebar />
        <main className="roomie-main relative ml-64 min-h-screen p-8">
          {storageError && (
            <p role="alert" className="form-error mb-4">
              {storageError}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
