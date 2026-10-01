import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));
const Expenses = lazy(() => import("../features/expenses/pages/Expenses"));
const Bills = lazy(() => import("../features/bills/pages/Bills"));
const Chores = lazy(() => import("../features/chores/pages/Chores"));
const Shopping = lazy(() => import("../features/shopping/pages/Shopping"));
const Members = lazy(() => import("../features/members/pages/Members"));

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <p role="status" className="panel text-sm text-[#8A809E]">
          Loading your home...
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
  );
}

export default AppRoutes;
