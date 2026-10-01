import { useState } from "react";
export function useAction() {
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
  return { error, perform };
}
