import {
  toDisplayAmount,
  type Currency,
} from "../../../shared/preferences/model.ts";
import { toCents } from "../../../shared/utils/money.ts";

/** Allocate whole SAR cents from shares entered in the selected currency. */
export function convertExactShares(
  displaySharesCents: Record<string, number>,
  amountCents: number,
  currency: Currency,
  pristineSharesCents?: Record<string, number>,
) {
  const entries = Object.entries(displaySharesCents);
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0)
    throw new Error("Enter a positive expense amount in SAR.");
  if (
    !entries.length ||
    !entries.every(([, cents]) => Number.isSafeInteger(cents) && cents >= 0)
  )
    throw new Error(
      "Enter nonnegative shares with at most two decimal places in SAR.",
    );

  // Displaying existing SAR shares in dollars can hide fractions of a cent.
  // Retain those authoritative amounts when their displayed values are unchanged.
  if (
    pristineSharesCents &&
    Object.keys(pristineSharesCents).length === entries.length &&
    entries.every(
      ([name, cents]) =>
        Number.isSafeInteger(pristineSharesCents[name]) &&
        pristineSharesCents[name] >= 0 &&
        toCents(toDisplayAmount(pristineSharesCents[name] / 100, currency)) ===
          cents,
    ) &&
    Object.values(pristineSharesCents).reduce(
      (sum, cents) => sum + BigInt(cents),
      0n,
    ) === BigInt(amountCents)
  )
    return { ...pristineSharesCents };

  const displayTotal = toCents(toDisplayAmount(amountCents / 100, currency));
  const enteredTotal = entries.reduce(
    (sum, [, cents]) => sum + BigInt(cents),
    0n,
  );
  if (enteredTotal !== BigInt(displayTotal))
    throw new Error("Exact shares must add up to the expense amount.");

  if (displayTotal === 0) {
    const base = Math.floor(amountCents / entries.length);
    const remainder = amountCents % entries.length;
    return Object.fromEntries(
      entries.map(([name], index) => [
        name,
        base + (index < remainder ? 1 : 0),
      ]),
    );
  }

  const denominator = BigInt(displayTotal);
  const portions = entries.map(([name, cents], index) => {
    const weighted = BigInt(cents) * BigInt(amountCents);
    return {
      name,
      index,
      cents: Number(weighted / denominator),
      remainder: weighted % denominator,
    };
  });
  const remaining =
    amountCents - portions.reduce((sum, portion) => sum + portion.cents, 0);
  const priority = [...portions].sort((first, second) =>
    first.remainder === second.remainder
      ? first.index - second.index
      : first.remainder > second.remainder
        ? -1
        : 1,
  );
  for (let index = 0; index < remaining; index += 1) priority[index].cents += 1;
  return Object.fromEntries(portions.map(({ name, cents }) => [name, cents]));
}
