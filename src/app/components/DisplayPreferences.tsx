import { Languages, Moon, Sun } from "lucide-react";
import { usePreferences } from "../../shared/preferences/PreferencesContext";

export default function DisplayPreferences() {
  const {
    t,
    language,
    currency,
    theme,
    setLanguage,
    setCurrency,
    setTheme,
    storageError,
  } = usePreferences();
  const themeLabel = t(
    theme === "light" ? "Switch to dark mode" : "Switch to light mode",
  );
  return (
    <div className="display-preferences-wrap">
      <div
        className="display-preferences"
        role="group"
        aria-label={t("Display preferences")}
      >
        <label className="display-preference">
          <Languages size={16} aria-hidden="true" />
          <span className="sr-only">{t("Language")}</span>
          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value === "ar" ? "ar" : "en")
            }
          >
            <option value="en" lang="en">
              English
            </option>
            <option value="ar" lang="ar">
              العربية
            </option>
          </select>
        </label>
        <label className="display-preference">
          <span className="sr-only">{t("Currency")}</span>
          <select
            value={currency}
            onChange={(event) =>
              setCurrency(event.target.value === "USD" ? "USD" : "SAR")
            }
          >
            <option value="SAR">
              {language === "ar" ? "ر.س · SAR" : "SAR · Riyal"}
            </option>
            <option value="USD">$ · USD</option>
          </select>
        </label>
        <button
          className="display-theme-button"
          type="button"
          aria-label={themeLabel}
          title={themeLabel}
          aria-pressed={theme === "dark"}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? (
            <Moon size={17} aria-hidden="true" />
          ) : (
            <Sun size={17} aria-hidden="true" />
          )}
        </button>
      </div>
      {storageError && (
        <p className="form-error" role="alert">
          {t(storageError)}
        </p>
      )}
    </div>
  );
}
