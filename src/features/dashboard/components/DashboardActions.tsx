import { Link } from "react-router-dom";
import { Plus, CalendarDays, ListChecks, ShoppingBasket } from "lucide-react";
const actions = [
  { label: "Add expense", to: "/expenses?add=1", icon: Plus },
  { label: "Add bill", to: "/bills?add=1", icon: CalendarDays },
  { label: "Add chore", to: "/chores?add=1", icon: ListChecks },
  { label: "Add item", to: "/shopping", icon: ShoppingBasket },
];
function DashboardActions() {
  return (
    <div className="relative flex flex-wrap gap-3">
      {actions.map(({ label, to, icon: Icon }, index) => (
        <Link
          key={to}
          to={to}
          className={index === 0 ? "primary-button" : "secondary-button"}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </div>
  );
}
export default DashboardActions;
