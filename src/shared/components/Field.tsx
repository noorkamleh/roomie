import type { ReactNode } from "react";
import { cloneElement, isValidElement, useId } from "react";
import { usePreferences } from "../preferences/PreferencesContext";
function Field({ label, children }: { label: string; children: ReactNode }) {
  const { t } = usePreferences();
  const labelId = useId();
  const control = isValidElement<{ "aria-labelledby"?: string }>(children)
    ? cloneElement(children, {
        "aria-labelledby": children.props["aria-labelledby"] ?? labelId,
      })
    : children;
  return (
    <label className="roomie-field">
      <span id={labelId}>{t(label)}</span>
      {control}
    </label>
  );
}
export default Field;
