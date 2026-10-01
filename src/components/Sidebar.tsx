import { NavLink } from "react-router-dom" 
import { LayoutDashboard, WalletCards, NotebookTabs, ListChecks, ShoppingBasket, UsersRound, } from "lucide-react"
const menuItems = [ { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", }, { label: "Expenses", icon: WalletCards, path: "/expenses", }, { label: "Bills", icon: NotebookTabs, path: "/bills", }, { label: "Chores", icon: ListChecks, path: "/chores", }, { label: "Shopping", icon: ShoppingBasket, path: "/shopping", }, { label: "Members", icon: UsersRound, path: "/members", }, ]
function Sidebar() { return ( <aside className="fixed left-0 top-0 h-screen w-64 overflow-hidden bg-[#CFC2B2] text-[#3F372F]">
  {/* ================= BACKGROUND ================= */}

  <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F2D9A6]/35 blur-3xl" />

  <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#A99379]/30 blur-3xl" />

  <div className="pointer-events-none absolute -right-24 top-[42%] h-72 w-72 rounded-full bg-[#E5C98F]/25 blur-3xl" />

  <div className="pointer-events-none absolute left-[-100px] top-[25%] h-64 w-64 rounded-full bg-[#F5E8D3]/25 blur-3xl" />


  {/* ================= MAIN ================= */}

  <div className="relative flex h-full flex-col border-r border-white/45 bg-[#CFC2B2]/85 backdrop-blur-2xl">

    {/* ================= BRAND ================= */}

    <div className="px-7 pb-8 pt-8">

      {/* Brand mark */}

      <div className="mb-5 flex items-center gap-2">

        <span className="text-[15px] leading-none text-[#B68A3A] drop-shadow-sm">
          ✦
        </span>

        <span className="h-px w-9 bg-[#F4E4C3]/75" />

      </div>


      {/* Logo */}

      <div className="relative inline-block">

        <div className="absolute -inset-3 rounded-full bg-[#F0D49A]/25 blur-xl" />

        <h1 className="relative font-sans text-[36px] font-semibold tracking-[-0.055em] text-[#332D28] drop-shadow-[0_2px_5px_rgba(80,65,45,0.12)]">
          Roomie
        </h1>

      </div>


      {/* Tagline */}

      <div className="mt-2 flex items-center gap-2">

        <span className="h-px w-5 bg-[#F4E4C3]/75" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#62584E]">
          Shared Home
        </p>

      </div>

    </div>


    {/* ================= NAVIGATION ================= */}

    <nav className="flex-1 px-4">

      <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#756A5E]">
        Workspace
      </p>


      <div className="space-y-2">

        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex w-full items-center gap-3 overflow-hidden rounded-[18px] px-3 py-3 transition-all duration-300 ease-out ${
                  isActive
                    ? "border border-[#E9D5A9] bg-[#F7F1E7] text-[#3C332A] shadow-[0_12px_30px_rgba(91,70,39,0.18),0_3px_8px_rgba(91,70,39,0.08)]"
                    : "border border-transparent text-[#574D43] hover:-translate-y-[1px] hover:border-white/45 hover:bg-[#E8DCCB]/55 hover:text-[#302A25] hover:shadow-[0_8px_24px_rgba(91,70,39,0.10)]"
                }`
              }
            >

              {({ isActive }) => (
                <>

                  {/* Glass shine */}

                  <span
                    className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ${
                      !isActive
                        ? "group-hover:translate-x-full"
                        : ""
                    }`}
                  />


                  {/* Left gold indicator */}

                  <span
                    className={`absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[#B68A3A] transition-all duration-300 ${isActive
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-70"
                    }`}
                  />


                  {/* Icon */}

                  <div
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border transition-all duration-300 ${
                      isActive
                        ? "border-[#E4CA96] bg-gradient-to-br from-[#F1DDAF] via-[#F7EBD0] to-[#E3C88E] shadow-[0_7px_18px_rgba(170,130,55,0.20),inset_0_1px_2px_rgba(255,255,255,0.95)]"
                        : "border-white/40 bg-[#E7DCCB]/45 group-hover:scale-105 group-hover:border-[#E7C98F]/70 group-hover:bg-[#EBDDC4]/70] group-hover:shadow-[0_5px_14px_rgba(120,90,40,0.10)]"
                    }`}
                  >

                    <Icon
                      size={20}
                      strokeWidth={1.9}
                      className={`transition-all duration-300 ${
                        isActive
                          ? "text-[#9A7027]"
                          : "text-[#685D51] group-hover:scale-110 group-hover:text-[#9A7027]"
                      }`}
                    />

                  </div>


                  {/* Label */}

                  <span
                    className={`relative text-sm font-semibold tracking-[0.01em] transition-all duration-300 ${
                      isActive
                        ? "text-[#40362C]"
                        : "text-[#5C5146] group-hover:translate-x-1 group-hover:text-[#302A25]"
                    }`}
                  >
                    {item.label}
                  </span>


                  {/* Active gold star */}

                  {isActive && (
                    <span className="ml-auto text-[11px] text-[#B68A3A] drop-shadow-sm">
                      ✦
                    </span>
                  )}

                </>
              )}

            </NavLink>
          )
        })}

      </div>

    </nav>


    {/* ================= FOOTER ================= */}

    <div className="px-6 pb-7">

      <div className="mb-5 h-px bg-white/40" />


      <div className="rounded-[18px] border border-[#E7D6B7]/70 bg-[#E9DDCA]/45 px-4 py-3 shadow-[0_8px_24px_rgba(91,70,39,0.10),inset_0_1px_2px_rgba(255,255,255,0.4)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-[1px] hover:bg-[#EFE2CE]/60">

        <div className="flex items-center gap-2">

          <span className="text-[11px] text-[#B68A3A] drop-shadow-sm">
            ✦
          </span>

          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#665B4E]">
            YOUR HOME, ORGANIZED
          </p>

        </div>

      </div>

    </div>

  </div>

</aside>
) }
export default Sidebar