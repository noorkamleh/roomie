import { useAction } from "../../../shared/hooks/useAction";
import { demoHousehold } from "../../household/utils/demo";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";

export function useDemoData() {
  const { commit } = useHousehold();
  const { t } = usePreferences();
  const { error, perform } = useAction();
  function loadDemo() {
    if (
      window.confirm(
        t(
          "Replace your current household with sample data? You can undo this immediately to restore your household.",
        ),
      )
    )
      perform(() => commit({ type: "household.demo", state: demoHousehold() }));
  }
  return { error, loadDemo };
}
