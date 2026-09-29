import { LayoutDashboard, WalletCards, NotebookTabs, ListChecks, ShoppingBasket, UsersRound, } from "lucide-react"
const menuItems = [ { label: "Dashboard", icon: LayoutDashboard, }, { label: "Expenses", icon: WalletCards, }, { label: "Bills", icon: NotebookTabs, }, { label: "Chores", icon: ListChecks, }, { label: "Shopping", icon: ShoppingBasket, }, { label: "Members", icon: UsersRound, }, ]
function Sidebar() { return ( <aside className="fixed left-0 top-0 h-screen w-64 overflow-hidden bg-[#9F9183] text-[#FFF9F2]">

  {/* ================= BACKGROUND ================= */}

  <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#E9DDD0]/25 blur-3xl" />

  <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#75665A]/20 blur-3xl" />

  <div className="pointer-events-none absolute right-[-80px] top-[42%] h-64 w-64 rounded-full bg-[#D8C6B4]/15 blur-3xl" />


  <div className="relative flex h-full flex-col border-r border-white/35 bg-[#B8AA9D]/10 backdrop-blur-2xl">


    {/* ================= BRAND ================= */}

    <div className="px-7 pb-8 pt-8">

      {/* Brand mark */}

      <div className="mb-5 flex items-center gap-2">

        <span className="text-[15px] leading-none text-[#FFF8EF] drop-shadow-[0_1px_4px_rgba(60,45,35,0.25)]">
          ✦
        </span>

        <span className="h-px w-9 bg-[#FFF8EF]/65" />

      </div>


      {/* Logo */}

      <div className="relative inline-block">

        <div className="absolute -inset-3 rounded-full bg-white/15 blur-xl" />

        <h1 className="relative font-sans text-[36px] font-semibold tracking-[-0.055em] text-[#FFFDF9] drop-shadow-[0_2px_8px_rgba(60,45,35,0.2)]">
          Roomie
         
        </h1>

      </div>


      {/* Tagline */}

      <div className="mt-2 flex items-center gap-2">

        <span className="h-px w-5 bg-[#FFF8EF]/65" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#FFF8EF]/90">
          Shared Home
        </p>

      </div>

    </div>


    {/* ================= NAVIGATION ================= */}

    <nav className="flex-1 px-4">

      <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFF8EF]/75">
        Workspace
      </p>


      <div className="space-y-2">

        {menuItems.map((item, index) => {
          const Icon = item.icon
          const active = index === 0

          return (
            <button
              key={item.label}
              className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 transition-all duration-300 ease-out ${
                active
                  ? "border border-white/70 bg-[#F5EBDD]/90 text-[#4A3930] shadow-[0_10px_28px_rgba(67,52,42,0.18)] backdrop-blur-xl"
                  : "border border-transparent text-[#FFF8F0] hover:-translate-y-[1px] hover:border-white/35 hover:bg-white/20 hover:shadow-[0_8px_25px_rgba(67,52,42,0.14)]"
              }`}
            >

              {/* Glass shine */}

              <span
                className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ${
                  !active
                    ? "group-hover:translate-x-full"
                    : ""
                }`}
              />


              {/* Left indicator */}

              <span
                className={`absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[#FFF8EF] transition-all duration-300 ${
                  active
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-80"
                }`}
              />


              {/* Icon */}

              <div
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                  active
? "border-white/70 bg-white/45 shadow-inner"
                    : "border-white/25 bg-white/18 group-hover:scale-105 group-hover:border-white/50 group-hover:bg-white/30"
                }`}
              >

                <Icon
                  size={20}
                  strokeWidth={1.9}
                  className={`transition-all duration-300 ${
                    active
                      ? "text-[#685146]"
                      : "text-[#FFF8F0] group-hover:scale-110 group-hover:text-white"
                  }`}
                />

              </div>


              {/* Label */}

              <span
                className={`relative text-sm font-semibold tracking-[0.01em] transition-all duration-300 ${
                  active
                    ? "text-[#49382F]"
                    : "text-[#FFF8F0] group-hover:translate-x-1 group-hover:text-white"
                }`}
              >
                {item.label}
              </span>


              {/* Active star */}

              {active && (
                <span className="ml-auto text-[10px] text-[#A47750] drop-shadow-sm">
                  ✦
                </span>
              )}

            </button>
          )
        })}

      </div>

    </nav>


    {/* ================= FOOTER ================= */}

    <div className="px-6 pb-7">

      <div className="mb-5 h-px bg-white/30" />

      <div className="rounded-2xl border border-white/30 bg-white/18 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-xl transition-all duration-300 hover:bg-white/25">

        <div className="flex items-center gap-2">

          <span className="text-[11px] text-[#FFF8EF] drop-shadow-sm">
            ✦
          </span>

          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#FFF8EF]/90">
            YOUR HOME, ORGANIZED
          </p>

        </div>

      </div>

    </div>

  </div>
</aside>
) }
export default Sidebar