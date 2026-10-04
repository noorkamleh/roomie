import type { ReactNode } from "react";
import { usePreferences } from "../preferences/PreferencesContext";
function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const { t } = usePreferences();
  return (
    <header className="relative flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--roomie-accent-purple,#9C80D6)]">
          {t("Shared home")}
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--roomie-ink,#17152C)]">
          {t(title)}
        </h1>
        <p className="mt-2 text-sm text-[color:var(--roomie-muted,#7973A5)]">
          {t(description)}
        </p>
      </div>
      {action}
    </header>
  );
}
export default PageHeader;
