import { usePreferences } from "../preferences/PreferencesContext";
interface StatusOption<T extends string> {
  value: T;
  label: string;
  tone: "purple" | "blue" | "amber" | "rose" | "mint";
}

function StatusFilters<T extends string>({
  label,
  options,
  value,
  counts,
  onChange,
}: {
  label: string;
  options: readonly StatusOption<T>[];
  value: T;
  counts: Record<T, number>;
  onChange: (value: T) => void;
}) {
  const { t } = usePreferences();
  return (
    <div className="status-filters" role="group" aria-label={t(label)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`status-filter status-filter--${option.tone} ${value === option.value ? "is-active" : ""}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          <span className="status-filter-dot" aria-hidden="true" />
          {t(option.label)}
          <span className="status-filter-count">{counts[option.value]}</span>
        </button>
      ))}
    </div>
  );
}
export default StatusFilters;
