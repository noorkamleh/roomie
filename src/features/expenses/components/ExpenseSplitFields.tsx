import type { ExpenseSplit, Member } from "../../../shared/types";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../../../shared/utils/formatCurrency";
import { isMoney } from "../../household/model/validation";
import Field from "../../../shared/components/Field";
import { splitExpense } from "../utils/calculations";
import { usePreferences } from "../../../shared/preferences/PreferencesContext";
import { getAmountCents, toCents } from "../../../shared/utils/money";
import {
  toBaseAmount as convertToBaseAmount,
  type Currency,
} from "../../../shared/preferences/model";
import { convertExactShares } from "../utils/currencyShares";

interface ExpenseSplitFieldsProps {
  members: Member[];
  amount: number;
  amountCents?: number;
  participants: string[];
  onChange: (participants: string[]) => void;
  split?: ExpenseSplit;
  onSplitChange?: (split?: ExpenseSplit) => void;
}

function shareUnits(value: string) {
  const parts = value.split(".");
  return /^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value)
    ? Number(parts[0] || "0") * 100 + Number((parts[1] ?? "").padEnd(2, "0"))
    : Number.NaN;
}

function ExpenseSplitFields({
  members,
  amount,
  amountCents,
  participants,
  onChange,
  split,
  onSplitChange,
}: ExpenseSplitFieldsProps) {
  const { t, currency, toDisplayAmount, toBaseAmount } = usePreferences();
  const [drafts, setDrafts] = useState<
    Record<string, { value: string; currency: Currency }>
  >(() => {
    const values =
      split?.mode === "amounts" ? split.sharesCents : split?.basisPoints;
    return Object.fromEntries(
      participants.map((member) => [
        member,
        {
          value:
            values && Number.isFinite(values[member])
              ? String(
                  split?.mode === "amounts"
                    ? toDisplayAmount(values[member] / 100)
                    : values[member] / 100,
                )
              : "0",
          currency,
        },
      ]),
    );
  });
  const baseTotal = getAmountCents({ amount, amountCents });
  const previousTotal = useRef(baseTotal);
  const displayedShares =
    split?.mode === "amounts"
      ? Object.fromEntries(
          participants.map((name) => {
            const draft = drafts[name];
            const units = split.sharesCents[name];
            const base = Number.isFinite(units)
              ? units / 100
              : draft
                ? convertToBaseAmount(Number(draft.value), draft.currency)
                : Number.NaN;
            return [
              name,
              draft?.currency === currency
                ? shareUnits(draft.value)
                : toCents(toDisplayAmount(base)),
            ];
          }),
        )
      : undefined;

  useEffect(() => {
    if (previousTotal.current === baseTotal) return;
    previousTotal.current = baseTotal;
    if (split?.mode !== "amounts" || !displayedShares || !onSplitChange) return;
    try {
      const nextShares = convertExactShares(
        displayedShares,
        baseTotal,
        currency,
        split.sharesCents,
      );
      onSplitChange({ mode: "amounts", sharesCents: nextShares });
    } catch {
      // Keep unfinished drafts visible until their displayed total matches.
    }
  }, [baseTotal, split, displayedShares, onSplitChange, currency]);

  let shares: { member: string; cents: number }[] = [];
  let splitError = "";
  if (isMoney(amount) || split !== undefined) {
    try {
      shares = splitExpense({ amount, amountCents, participants, split });
    } catch (error) {
      splitError = error instanceof Error ? error.message : "Check the split.";
    }
  }

  if (splitError && split?.mode === "amounts" && displayedShares) {
    try {
      convertExactShares(
        displayedShares,
        baseTotal,
        currency,
        split.sharesCents,
      );
    } catch (error) {
      splitError = error instanceof Error ? error.message : "Check the split.";
    }
  }

  function changeParticipants(nextParticipants: string[]) {
    onChange(nextParticipants);
    if (!split || !onSplitChange) return;
    const values =
      split.mode === "amounts" ? split.sharesCents : split.basisPoints;
    const nextValues = Object.fromEntries(
      nextParticipants.map((member) => [
        member,
        Object.prototype.hasOwnProperty.call(values, member)
          ? values[member]
          : 0,
      ]),
    );
    setDrafts((current) =>
      Object.fromEntries(
        nextParticipants.map((member) => [
          member,
          Object.prototype.hasOwnProperty.call(current, member)
            ? current[member]
            : {
                value: String(
                  split.mode === "amounts"
                    ? toDisplayAmount(nextValues[member] / 100)
                    : nextValues[member] / 100,
                ),
                currency,
              },
        ]),
      ),
    );
    onSplitChange(
      split.mode === "amounts"
        ? { mode: "amounts", sharesCents: nextValues }
        : { mode: "percentages", basisPoints: nextValues },
    );
  }

  function changeMethod(method: string) {
    if (!onSplitChange) return;
    if (method === "equal") {
      setDrafts({});
      onSplitChange(undefined);
      return;
    }
    let defaults: { member: string; cents: number }[] = [];
    try {
      defaults = splitExpense({
        amount: method === "percentages" ? 100 : amount,
        amountCents: method === "percentages" ? 10000 : amountCents,
        participants,
      });
    } catch {
      defaults = participants.map((member) => ({ member, cents: 0 }));
    }
    let values = Object.fromEntries(
      defaults.map(({ member, cents }) => [member, cents]),
    );
    let displayedValues = Object.fromEntries(
      defaults.map(({ member, cents }) => [
        member,
        method === "amounts" ? toCents(toDisplayAmount(cents / 100)) : cents,
      ]),
    );
    if (method === "amounts" && currency === "USD") {
      try {
        const displayTotal = toCents(
          toDisplayAmount(getAmountCents({ amount, amountCents }) / 100),
        );
        if (displayTotal > 0) {
          displayedValues = Object.fromEntries(
            splitExpense({
              amount: displayTotal / 100,
              amountCents: displayTotal,
              participants,
            }).map(({ member, cents }) => [member, cents]),
          );
          values = convertExactShares(
            displayedValues,
            getAmountCents({ amount, amountCents }),
            currency,
          );
        }
      } catch {
        // Keep the validation result visible while the total is incomplete.
      }
    }
    setDrafts(
      Object.fromEntries(
        participants.map((member) => [
          member,
          { value: String(displayedValues[member] / 100), currency },
        ]),
      ),
    );
    onSplitChange(
      method === "amounts"
        ? { mode: "amounts", sharesCents: values }
        : { mode: "percentages", basisPoints: values },
    );
  }

  function changeShare(member: string, value: string) {
    if (!split || !onSplitChange) return;
    setDrafts((current) => ({ ...current, [member]: { value, currency } }));
    const units = shareUnits(value);
    if (split.mode === "amounts") {
      const baseTotal = getAmountCents({ amount, amountCents });
      let sharesCents = {
        ...split.sharesCents,
        [member]: Number.isFinite(units)
          ? toCents(toBaseAmount(units / 100))
          : units,
      };
      const displayShares = Object.fromEntries(
        participants.map((name) => [
          name,
          name === member
            ? units
            : drafts[name]?.currency === currency
              ? shareUnits(drafts[name].value)
              : toCents(toDisplayAmount(split.sharesCents[name] / 100)),
        ]),
      );
      try {
        sharesCents = convertExactShares(
          displayShares,
          baseTotal,
          currency,
          split.sharesCents,
        );
      } catch {
        // An invalid marker prevents saving mismatched display totals; raw drafts remain visible.
        const first = participants[0];
        if (
          first &&
          Object.values(sharesCents).every(Number.isSafeInteger) &&
          Object.values(sharesCents).reduce((sum, cents) => sum + cents, 0) ===
            baseTotal
        )
          sharesCents = { ...sharesCents, [first]: Number.NaN };
      }
      onSplitChange({ mode: "amounts", sharesCents });
      return;
    }
    onSplitChange({
      mode: "percentages",
      basisPoints: { ...split.basisPoints, [member]: units },
    });
  }
  return (
    <fieldset className="rounded-2xl border border-[color:var(--roomie-border,#EAE3F7)] p-4">
      <legend className="px-2 text-sm font-semibold text-[color:var(--roomie-text,#4A3F6C)]">
        {t("Split between")}
      </legend>
      {onSplitChange && (
        <div className="expense-split-method">
          <Field label={t("Split method")}>
            <select
              value={split?.mode ?? "equal"}
              onChange={(event) => changeMethod(event.target.value)}
            >
              <option value="equal">{t("Equally")}</option>
              <option value="amounts">{t("Exact amounts")}</option>
              <option value="percentages">{t("Percentages")}</option>
            </select>
          </Field>
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {members.map((member) => (
          <label key={member.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={participants.includes(member.name)}
              onChange={(event) =>
                changeParticipants(
                  event.target.checked
                    ? [...participants, member.name]
                    : participants.filter((name) => name !== member.name),
                )
              }
            />
            {member.name}
          </label>
        ))}
      </div>
      {onSplitChange && split && (
        <div className="expense-custom-share-fields">
          {participants.map((member) => {
            const units =
              split.mode === "amounts"
                ? split.sharesCents[member]
                : split.basisPoints[member];
            return (
              <Field
                key={member}
                label={t("Share for {member} ({currency})", {
                  member,
                  currency:
                    split.mode === "amounts"
                      ? currency === "SAR"
                        ? t("SAR")
                        : "$"
                      : "%",
                })}
              >
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={
                    drafts[member] &&
                    (split.mode !== "amounts" ||
                      drafts[member].currency === currency ||
                      !Number.isFinite(units))
                      ? drafts[member].value
                      : Number.isFinite(units)
                        ? String(
                            split.mode === "amounts"
                              ? toDisplayAmount(units / 100)
                              : units / 100,
                          )
                        : ""
                  }
                  onChange={(event) => changeShare(member, event.target.value)}
                />
              </Field>
            );
          })}
        </div>
      )}
      {splitError && (
        <p className="expense-split-error" role="status" aria-live="polite">
          {splitError ===
            "Enter nonnegative shares with at most two decimal places in SAR." &&
          currency === "USD"
            ? t(
                "Enter nonnegative shares with at most two decimal places in {currency}.",
                { currency: "USD" },
              )
            : t(splitError)}
        </p>
      )}
      {shares.length > 0 && (
        <div className="mt-4 space-y-1 border-t border-[color:var(--roomie-border,#EFE9F8)] pt-3">
          {shares.map((share) => (
            <p
              key={share.member}
              className="flex justify-between text-xs text-[color:var(--roomie-muted,#817595)]"
            >
              <span>{t("{member}'s share", { member: share.member })}</span>
              <span>{formatCurrency(share.cents / 100)}</span>
            </p>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-[color:var(--roomie-muted,#8A809E)]">
        {split?.mode === "amounts"
          ? t(
              "Exact shares must add up to the total. A selected member can have a zero share.",
            )
          : split?.mode === "percentages"
            ? t(
                "Percentages must add up to 100%. Rounding differences go to the largest fractional shares.",
              )
            : t(
                "Shares are equal; rounding differences go to the first selected members.",
              )}
      </p>
    </fieldset>
  );
}
export default ExpenseSplitFields;
