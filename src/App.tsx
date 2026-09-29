import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard" 

import Expenses from "./pages/Expenses"
 import Bills from "./pages/Bills"
  import Chores from "./pages/Chores"
  import Shopping from "./pages/Shopping" 
  import Members from "./pages/Members"
function App() { return ( <BrowserRouter> <div className="min-h-screen bg-[#F4EFE9]">
    <Sidebar />

    <main className="ml-64 min-h-screen p-8">

      <Routes>

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/expenses"
          element={<Expenses />}
        />

        <Route
          path="/bills"
          element={<Bills />}
        />

        <Route
          path="/chores"
          element={<Chores />}
        />

        <Route
          path="/shopping"
          element={<Shopping />}
        />

        <Route
          path="/members"
          element={<Members />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </main>

  </div>
</BrowserRouter>
) }
export default App