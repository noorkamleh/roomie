import { NavLink } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  WalletCards,
  NotebookTabs,
  ListChecks,
  ShoppingBasket,
  UsersRound,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Expenses", icon: WalletCards, path: "/expenses" },
  { label: "Bills", icon: NotebookTabs, path: "/bills" },
  { label: "Chores", icon: ListChecks, path: "/chores" },
  { label: "Shopping", icon: ShoppingBasket, path: "/shopping" },
  { label: "Members", icon: UsersRound, path: "/members" },
];

function Sidebar() {
  return (
    <aside className="roomie-sidebar fixed left-0 top-0 z-20 flex h-dvh w-64 flex-col overflow-y-auto border-r border-[#ECEBFA] bg-white/90 text-[#222044]">
      <div className="flex items-center gap-3 px-7 pb-9 pt-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0E9FF]">
          <Home
            size={27}
            className="text-[#8246FF]"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>
        <div>
          <p className="text-[30px] font-bold leading-none tracking-[-0.055em] text-[#111125]">
            Roomie
          </p>
          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#8783AF]">
            Shared Home
          </p>
        </div>
      </div>
      <nav className="flex-1 px-4" aria-label="Main navigation">
        <div className="space-y-2">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#8246FF] ${isActive ? "bg-[#F2ECFF] font-semibold text-[#7540F6] before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full before:bg-[#8246FF]" : "font-medium text-[#302D56] hover:bg-[#F7F4FF] hover:text-[#7540F6]"}`
              }
            >
              <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="px-6 pb-7 pt-8">
        <div className="roomie-home-background rounded-2xl border border-[#EEE8FF] bg-[#FAF8FF] px-4 py-4 text-center">
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8780B2]">
            YOUR HOME, ORGANIZED
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
