import { useEffect, useState } from "react";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

export function useDashboardClock() {
  const { t, locale } = usePreferences();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const updateTime = () => setNow(new Date());
    const timer = window.setInterval(updateTime, 1000);
    window.addEventListener("focus", updateTime);
    document.addEventListener("visibilitychange", updateTime);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateTime);
      document.removeEventListener("visibilitychange", updateTime);
    };
  }, []);

  const hour = now.getHours();
  const greeting = t(
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening",
  );
  const dayLabel = now.toLocaleDateString(locale, {
    weekday: "long",
  });
  const timeLabel = now.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const monthLabel = now.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
  return { greeting, dayLabel, timeLabel, monthLabel };
}
