import { createContext, useContext } from "react";
import type { TranslationParams } from "../preferences/i18n";

export interface ConfirmationOptions {
  title: string;
  message: string;
  params?: TranslationParams;
  confirmLabel: string;
  intent?: "danger" | "default";
}

export const ConfirmationContext = createContext<
  ((options: ConfirmationOptions) => Promise<boolean>) | null
>(null);

export function useConfirmation() {
  const confirm = useContext(ConfirmationContext);
  if (!confirm) throw new Error("ConfirmationProvider is missing.");
  return confirm;
}
