import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { PreferencesContext } from "./PreferencesContext";
import {
  applyDocumentPreferences,
  currencyText,
  getPreferences,
  parsePreferences,
  PREFERENCES_KEY,
  preferenceLocale,
  readPreferences,
  toBaseAmount,
  toDisplayAmount,
} from "./model";
import type { Preferences } from "./model";
import { createTranslator } from "./i18n";

export default function PreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [storageError, setStorageError] = useState<string | null>(null);
  const update = useCallback((change: Partial<Preferences>) => {
    let latest = getPreferences();
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved !== null) latest = parsePreferences(saved);
    } catch {
      // Keep session preferences when browser storage is unavailable.
    }
    const next = { ...latest, ...change };
    applyDocumentPreferences(next);
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
      setStorageError(null);
    } catch {
      setStorageError(
        "Display settings apply for this session. Browser storage is unavailable.",
      );
    }
    setPreferences(next);
  }, []);

  useEffect(() => {
    applyDocumentPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    function synchronize(event: StorageEvent) {
      if (event.key !== PREFERENCES_KEY && event.key !== null) return;
      if (event.storageArea !== localStorage) return;
      const next = readPreferences();
      applyDocumentPreferences(next);
      setPreferences(next);
      setStorageError(null);
    }
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, []);

  const value = useMemo(
    () => ({
      ...preferences,
      locale: preferenceLocale(preferences.language),
      t: createTranslator(preferences.language),
      setLanguage: (language: Preferences["language"]) => update({ language }),
      setCurrency: (currency: Preferences["currency"]) => update({ currency }),
      setTheme: (theme: Preferences["theme"]) => update({ theme }),
      toDisplayAmount: (amount: number) =>
        toDisplayAmount(amount, preferences.currency),
      toBaseAmount: (amount: number) =>
        toBaseAmount(amount, preferences.currency),
      formatCurrency: (amount: number) =>
        currencyText(amount, preferences.currency, preferences.language),
      storageError,
    }),
    [preferences, update, storageError],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}
