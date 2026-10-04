export const MAX_MONEY_CENTS = 10_000_000_000;

export function toCents(amount: number) {
  return Math.round(amount * 100);
}

export function getAmountCents(value: {
  amount: number;
  amountCents?: number;
}) {
  return value.amountCents ?? toCents(value.amount);
}

export function withAmountCents<T extends { amount: number }>(value: T) {
  return { ...value, amountCents: toCents(value.amount) };
}
