import Sidebar from "./components/Sidebar"
function App() { return ( <div className="min-h-screen bg-slate-50">
  <Sidebar />

  <main className="ml-64 p-8">
    <h1 className="text-3xl font-bold text-slate-900">
      Dashboard
    </h1>

    <p className="mt-2 text-slate-500">
      Welcome back, Noor 👋
    </p>
  </main>

</div>
) }
export default App