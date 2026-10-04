import { usePreferences } from "../preferences/PreferencesContext";
function EmptyState({ message }: { message: string }) {
  const { t } = usePreferences();
  return (
    <p className="rounded-2xl border border-dashed border-[color:var(--roomie-border,#DDD3F5)] bg-[color:var(--roomie-surface,#FAF8FF)] px-6 py-10 text-center text-sm text-[color:var(--roomie-muted,#82799F)]">
      {t(message)}
    </p>
  );
}
export default EmptyState;
