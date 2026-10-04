import { useState } from "react";
import { usePreferences } from "../preferences/PreferencesContext";
export function useAction() {
  const { t, currency } = usePreferences();
  const [error, setError] = useState<string | null>(null);
  function perform(action: () => void) {
    try {
      action();
      setError(null);
      return true;
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not save changes.",
      );
      return false;
    }
  }
  const displayedError =
    error ===
      "Enter nonnegative shares with at most two decimal places in SAR." &&
    currency === "USD"
      ? t(
          "Enter nonnegative shares with at most two decimal places in {currency}.",
          { currency: "USD" },
        )
      : error
        ? t(error)
        : null;
  return { error: displayedError, perform };
}
