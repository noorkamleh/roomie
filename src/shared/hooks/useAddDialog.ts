import { useState } from "react";
import { useSearchParams } from "react-router-dom";
export function useAddDialog() {
  const [params, setParams] = useSearchParams();
  const [opened, setOpened] = useState(false);
  function close() {
    setOpened(false);
    if (params.has("add")) {
      const next = new URLSearchParams(params);
      next.delete("add");
      setParams(next, { replace: true });
    }
  }
  return {
    isOpen: opened || params.get("add") === "1",
    open: () => setOpened(true),
    close,
  };
}
