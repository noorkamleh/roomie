import type { ShoppingItem } from "../../../shared/types";
import { translate } from "../../../shared/preferences/i18n.ts";

const quantityFormatter = new Intl.NumberFormat("en-US", {
  numberingSystem: "latn",
  useGrouping: false,
});

export function formatShoppingQuantity(
  item: Pick<ShoppingItem, "quantity" | "unit">,
) {
  const plurals: Record<string, string> = {
    pc: "pcs",
    pack: "packs",
    bottle: "bottles",
    box: "boxes",
  };
  const unit =
    item.unit && item.quantity !== 1
      ? (plurals[item.unit] ?? item.unit)
      : item.unit;
  return `${quantityFormatter.format(item.quantity)}${unit ? ` ${translate(unit)}` : ""}`;
}
