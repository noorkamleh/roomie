import { usePreferences } from "../../../shared/preferences/PreferencesContext";
const tabs = ["Balances", "Household"] as const;
export type MembersTab = (typeof tabs)[number];

function MembersTabs({
  value,
  onChange,
}: {
  value: MembersTab;
  onChange: (value: MembersTab) => void;
}) {
  const { t, language } = usePreferences();
  return (
    <div
      className="members-tabs"
      role="tablist"
      aria-label={t("Members sections")}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={`members-tab-${tab}`}
          aria-selected={value === tab}
          aria-controls="members-tab-panel"
          tabIndex={value === tab ? 0 : -1}
          onClick={() => onChange(tab)}
          onKeyDown={(event) => {
            const next =
              event.key === (language === "ar" ? "ArrowLeft" : "ArrowRight")
                ? (index + 1) % tabs.length
                : event.key === (language === "ar" ? "ArrowRight" : "ArrowLeft")
                  ? (index + tabs.length - 1) % tabs.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? tabs.length - 1
                      : null;
            if (next === null) return;
            event.preventDefault();
            onChange(tabs[next]);
            const buttons =
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                "[role=tab]",
              );
            buttons?.[next].focus();
          }}
        >
          {t(tab)}
        </button>
      ))}
    </div>
  );
}
export default MembersTabs;
