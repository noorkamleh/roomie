import type { ReactNode } from "react";
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="roomie-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export default Field;
