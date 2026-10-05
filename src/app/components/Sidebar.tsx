import homeIllustration from "../../assets/roomie-home-cutout.png";
import { NavLink } from "react-router-dom";
import { usePreferences } from "../../shared/preferences/PreferencesContext";
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
  const { t } = usePreferences();
  return (
    <aside className="roomie-sidebar fixed start-0 top-0 z-20 flex h-dvh flex-col overflow-y-auto border-e border-[color:var(--roomie-border,#ECEBFA)] bg-[color:var(--roomie-surface,#fff)]/90 text-[color:var(--roomie-ink,#222044)]">
      <div className="flex items-center gap-3 px-5 pb-9 pt-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--roomie-tint-purple,#F0E9FF)]">
          <Home
            size={27}
            className="text-[color:var(--roomie-accent-purple,#8246FF)]"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>
        <div>
          <p className="text-[30px] font-bold leading-none tracking-[-0.055em] text-[color:var(--roomie-ink,#111125)]">
            <bdi>Roomie</bdi>
          </p>
          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-[color:var(--roomie-muted,#8783AF)]">
            {t("Shared Home")}
          </p>
        </div>
      </div>
      <nav className="flex-1 px-4" aria-label={t("Main navigation")}>
        <div className="space-y-2">
          {menuItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              aria-label={t(label)}
              title={t(label)}
              className={({ isActive }) =>
                `relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-[#8246FF] ${isActive ? "bg-[color:var(--roomie-surface-soft,#F2ECFF)] font-semibold text-[color:var(--roomie-accent-purple,#7540F6)] before:absolute before:inset-y-3 before:start-0 before:w-[3px] before:rounded-full before:bg-[#8246FF]" : "font-medium text-[color:var(--roomie-text,#302D56)] hover:bg-[color:var(--roomie-surface,#F7F4FF)] hover:text-[color:var(--roomie-accent-purple,#7540F6)]"}`
              }
            >
              <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
              <span>{t(label)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="px-4 pb-7 pt-8">
        <div className="roomie-home-art text-center">
          <img
            src={homeIllustration}
            alt=""
            className="roomie-home-illustration"
            loading="lazy"
            decoding="async"
            width={1536}
            height={1024}
          />
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--roomie-muted,#8780B2)]">
            {t("YOUR HOME, ORGANIZED")}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
