import { createContext, useContext } from "react";
import type { Preferences, Language, Currency, Theme } from "./model";
import type { Translator } from "./i18n";

export interface PreferencesValue extends Preferences {
  locale: string;
  t: Translator;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  setTheme: (theme: Theme) => void;
  toDisplayAmount: (amountSAR: number) => number;
  toBaseAmount: (amount: number) => number;
  formatCurrency: (amountSAR: number) => string;
  storageError: string | null;
}
export const PreferencesContext = createContext<PreferencesValue | null>(null);
export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("PreferencesProvider is missing.");
  return value;
}
