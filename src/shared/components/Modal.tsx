import { useEffect, useId, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { X } from "lucide-react";
import { usePreferences } from "../preferences/PreferencesContext";
function Modal({
  title,
  children,
  onClose,
  descriptionId,
  initialFocusRef,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  descriptionId?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
}) {
  const { t } = usePreferences();
  const ref = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog?.showModal();
    initialFocusRef?.current?.focus();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [initialFocusRef]);
  return (
    <dialog
      ref={ref}
      className="roomie-dialog"
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2
            id={headingId}
            className="text-xl font-bold text-[color:var(--roomie-ink,#242040)]"
          >
            {t(title)}
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label={t("Close dialog")}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export default Modal;
