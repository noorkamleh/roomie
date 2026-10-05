import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CircleAlert, CircleHelp } from "lucide-react";
import { useLocation } from "react-router-dom";
import Modal from "../components/Modal";
import { usePreferences } from "../preferences/PreferencesContext";
import { ConfirmationContext } from "./ConfirmationContext";
import type { ConfirmationOptions } from "./ConfirmationContext";

function ConfirmationProvider({ children }: { children: ReactNode }) {
  const { t } = usePreferences();
  const location = useLocation();
  const [pending, setPending] = useState<ConfirmationOptions | null>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const settle = useCallback((confirmed: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    setPending(null);
    resolve?.(confirmed);
  }, []);
  const confirm = useCallback((options: ConfirmationOptions) => {
    // Ignore repeated requests while a decision is already open.
    if (resolveRef.current) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setPending(options);
    });
  }, []);

  // Leaving a page cancels its pending action, including browser back/forward.
  useEffect(() => () => settle(false), [location.key, settle]);

  const Icon = pending?.intent === "danger" ? CircleAlert : CircleHelp;
  return (
    <ConfirmationContext.Provider value={confirm}>
      {children}
      {pending && (
        <Modal
          title={pending.title}
          descriptionId={messageId}
          initialFocusRef={cancelRef}
          onClose={() => settle(false)}
        >
          <div
            className="confirmation-content"
            data-intent={pending.intent ?? "default"}
          >
            <span className="confirmation-icon" aria-hidden="true">
              <Icon size={26} />
            </span>
            <p id={messageId} className="confirmation-message">
              {t(pending.message, pending.params)}
            </p>
          </div>
          <div className="confirmation-actions">
            <button
              type="button"
              className="secondary-button"
              ref={cancelRef}
              onClick={() => settle(false)}
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              className={
                pending.intent === "danger"
                  ? "primary-button confirmation-danger"
                  : "primary-button"
              }
              onClick={() => settle(true)}
            >
              {t(pending.confirmLabel)}
            </button>
          </div>
        </Modal>
      )}
    </ConfirmationContext.Provider>
  );
}

export default ConfirmationProvider;
