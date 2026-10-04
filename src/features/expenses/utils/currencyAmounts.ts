import {
  SAR_PER_USD,
  toDisplayAmount,
  type Currency,
} from "../../../shared/preferences/model.ts";
import { MAX_MONEY_CENTS } from "../../../shared/utils/money.ts";

export function maxDisplayInputAmount(
  currency: Currency,
  pristineBaseAmount?: number,
) {
  const maximum =
    currency === "USD"
      ? Math.floor(MAX_MONEY_CENTS / SAR_PER_USD) / 100
      : MAX_MONEY_CENTS / 100;
  return pristineBaseAmount !== undefined
    ? Math.max(maximum, toDisplayAmount(pristineBaseAmount, currency))
    : maximum;
}
