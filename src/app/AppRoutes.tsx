import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { usePreferences } from "../shared/preferences/PreferencesContext";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));
const Expenses = lazy(() => import("../features/expenses/pages/Expenses"));
const Bills = lazy(() => import("../features/bills/pages/Bills"));
const Chores = lazy(() => import("../features/chores/pages/Chores"));
const Shopping = lazy(() => import("../features/shopping/pages/Shopping"));
const Members = lazy(() => import("../features/members/pages/Members"));

function AppRoutes() {
  const { t } = usePreferences();
  const { pathname } = useLocation();
  return (
    <RouteErrorBoundary key={pathname}>
      <Suspense
        fallback={
          <p
            role="status"
            className="panel text-sm text-[color:var(--roomie-muted,#8A809E)]"
          >
            {t("Loading your home...")}
          </p>
        }
      >
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/chores" element={<Chores />} />
          <Route path="/shopping" element={<Shopping />} />
          <Route path="/members" element={<Members />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </RouteErrorBoundary>
  );
}

export default AppRoutes;
