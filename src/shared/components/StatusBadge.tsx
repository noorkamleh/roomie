import { usePreferences } from "../preferences/PreferencesContext";
const styles: Record<string, string> = {
  paid: "bg-[color:var(--roomie-tint-mint,#DCF9EE)] text-[color:var(--roomie-accent-mint,#187B5A)]",
  completed:
    "bg-[color:var(--roomie-tint-mint,#DCF9EE)] text-[color:var(--roomie-accent-mint,#187B5A)]",
  pending:
    "bg-[color:var(--roomie-tint-purple,#F0E9FF)] text-[color:var(--roomie-accent-purple,#7949C7)]",
  "in-progress":
    "bg-[color:var(--roomie-tint-blue,#E6F0FF)] text-[color:var(--roomie-accent-blue,#326CC6)]",
  "due-soon":
    "bg-[color:var(--roomie-tint-amber,#FFF2D9)] text-[color:var(--roomie-accent-amber,#9C6B15)]",
  overdue:
    "bg-[color:var(--roomie-tint-rose,#FFE8EE)] text-[color:var(--roomie-accent-rose,#BC4167)]",
};
function StatusBadge({ status }: { status: string }) {
  const { t } = usePreferences();
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] ?? styles.pending}`}
    >
      {t(status.replaceAll("-", " "))}
    </span>
  );
}
export default StatusBadge;
