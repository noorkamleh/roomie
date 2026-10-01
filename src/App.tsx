import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
 import Sidebar from "./components/Sidebar" 
 import Dashboard from "./pages/Dashboard" 
 import Expenses from "./pages/Expenses" 
 import Bills from "./pages/Bills" 
 import Chores from "./pages/Chores" 
 import Shopping from "./pages/Shopping" 
 import Members from "./pages/Members"
function App() { return ( <BrowserRouter>
  <div className="relative min-h-screen overflow-hidden bg-[#F2F1F4]">

    {/* Page background */}

    <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#E5D7FF]/30 blur-3xl" />

    <div className="pointer-events-none absolute right-[-120px] top-[-80px] h-96 w-96 rounded-full bg-[#CDEBFF]/35 blur-3xl" />

    <div className="pointer-events-none absolute bottom-[-150px] left-[40%] h-96 w-96 rounded-full bg-[#F9E8ED]/40 blur-3xl" />

    <div className="relative z-10">

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

  </div>

</BrowserRouter>
) }
export default App