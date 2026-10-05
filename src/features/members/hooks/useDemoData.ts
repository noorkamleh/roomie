import { useAction } from "../../../shared/hooks/useAction";
import { demoHousehold } from "../../household/utils/demo";
import { useHousehold } from "../../household/hooks/HouseholdContext";
import { useConfirmation } from "../../../shared/confirmation/ConfirmationContext";

export function useDemoData() {
  const { commit } = useHousehold();
  const confirm = useConfirmation();
  const { error, perform } = useAction();
  async function loadDemo() {
    if (
      await confirm({
        title: "Load demo data",
        message:
          "Replace your current household with sample data? You can undo this immediately to restore your household.",
        confirmLabel: "Load demo data",
      })
    )
      perform(() => commit({ type: "household.demo", state: demoHousehold() }));
  }
  return { error, loadDemo };
}
