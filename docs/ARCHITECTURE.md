# Architecture and domain rules

Roomie is a React application built with TypeScript, Vite, Tailwind CSS, Recharts, and Lucide icons. It has no backend. Browser storage is the persistence boundary, and the feature UI communicates with it through household commands.

## Source organization

```text
src/
  app/                 Routes, application shell, navigation, route recovery
  features/
    dashboard/         Personal overview, activity, chart aggregation
    expenses/          Ledger, splits, budgets, financial calculations
    bills/             Bill creation, payment, monthly recurrence
    chores/            Tasks, rotation, recurrence, swaps, completion history
    shopping/          List, quantities, purchases linked to expenses
    members/           Balances, repayments, household settings, member lifecycle
    household/         State, commands, validation, persistence, Undo, demo data
  shared/              UI, types, hooks, formatting, display preferences
tests/e2e/             Browser workflow and regression scenarios
```

Pages compose components. Hooks connect state and UI behavior. Pure functions own calculations and domain rules. Routes load features lazily; an error boundary keeps the shell and navigation available if a page cannot be loaded and provides a reload action.

The compatibility export at `src/pages/Dashboard.tsx` retains an earlier import path. Project conventions are in [src/AGENTS.md](../src/AGENTS.md).

## Household command flow

The household contains members, expenses, bills, chores, shopping items, settlements, and optional monthly budgets. `currentUser` is the selected viewing perspective.

1. A feature form or hook sends a typed command through `HouseholdProvider`.
2. The session checks that the browser's saved snapshot still matches the one held by this tab.
3. The pure reducer constructs the complete next state and validates it.
4. History checks for a semantic no-op, then persists the next state. Persistence checks the snapshot again immediately before writing.
5. Only a successful write changes in-memory state and records the previous state for Undo. The provider publishes the result to React.

This order keeps a failed write from displaying changes that were never saved. A linked purchase or recurring bill payment is one command and one complete saved household snapshot, so Undo restores its related records together.

Key files:

- [HouseholdProvider](../src/features/household/components/HouseholdProvider.tsx): React integration and storage events.
- [household.ts](../src/features/household/model/household.ts): commands and domain transitions.
- [validation.ts](../src/features/household/model/validation.ts): record and relationship validation.
- [history.ts](../src/features/household/model/history.ts): semantic no-ops and one-step Undo.
- [persistence.ts](../src/features/household/model/persistence.ts): stale snapshot checks and session errors.
- [storage.ts](../src/features/household/model/storage.ts): versioned reads and compatibility normalization.

## Money and splits

Amounts are stored in SAR. New and loaded money records contain integer `amountCents` fields; the decimal `amount` remains for compatibility and must agree with those cents. One SAR is 100 halalas. The supported maximum is 100,000,000 SAR.

The application's fixed display/input conversion is 1 USD = 3.75 SAR. Conversion rounds exact rational cents to the nearest cent, with ties away from zero, and normalizes negative zero. It does not fetch market exchange rates. Changing the currency affects presentation and new input interpretation, not stored records.

| Split         | Rule                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Equal         | Divide whole halalas evenly; remaining halalas go to participants in selection order.                                             |
| Exact amounts | Each participant has one nonnegative share and all shares total the expense.                                                      |
| Percentages   | Integer basis points must total 10000; distribute remaining halalas to the largest fractional remainders, then participant order. |

For example, 100 SAR split equally among three people produces 33.34, 33.33, and 33.33 SAR. A payer can be outside the participant list.

Dollar entry needs an additional allocation step: independently rounding every share can change the household total. `convertExactShares` validates the displayed total, allocates authoritative SAR cents proportionally, and distributes remainders deterministically. For 3.75 SAR with dollar shares of $0.33, $0.33, and $0.34, stored shares are 124, 124, and 127 halalas.

Existing amounts and shares remain authoritative when an edit leaves the displayed amounts unchanged. This matters when a 0.01 SAR expense displays as $0.00, or several stored shares display a dollar total one cent away from the displayed expense total. A currency switch must not rewrite that history merely because its display loses precision.

Positive balance means money receivable; negative balance means money owed. Repayments have separate records and change balances without adding spending. Debt simplification changes suggested repayment routes while retaining the original expenses and net balances. Expense dates control monthly spending and budgets; future expenses are excluded from the dashboard's month-to-date totals and remain identifiable in ledger reports.

Key files: [calculations.ts](../src/features/expenses/utils/calculations.ts), [currencyShares.ts](../src/features/expenses/utils/currencyShares.ts), [currencyAmounts.ts](../src/features/expenses/utils/currencyAmounts.ts), [budgets.ts](../src/features/expenses/utils/budgets.ts), and [preferences/model.ts](../src/shared/preferences/model.ts).

## Linked records and recurrence

- **Bill payment:** creates an expense with an ID derived from the bill, records the selected payer/date/participants, marks the bill paid, and creates the next monthly occurrence once. Linked expenses cannot be edited or deleted independently. Validation checks that linked payment amounts and categories agree with their bills; historical paid bills without a linked expense remain readable.
- **Monthly dates:** recurrence preserves an anchor day. A January 31 occurrence moves to February's last day and returns to March 31. The next record has a deterministic identity, which prevents repeated completion/payment commands from duplicating it.
- **Chores:** completing an occurrence records who finished it and when, preserves completion history, and creates the next pending occurrence with the configured rotation. Swaps change the assignment for one occurrence; only the assigned member can request one and only the requested recipient can respond.
- **Shopping purchase:** creates one expense with quantity/unit snapshots and links the selected items to it. An item can belong to only one recorded purchase. Deleting that expense releases its item links.
- **Member archiving:** retains financial and completed-task history, excludes the member from new assignments/shares, and reassigns open chores to an active housemate. Outstanding archived balances can still be settled.

## Storage behavior and limits

Household records use the versioned `roomie.household.v1` browser storage key. Display preferences use `roomie.preferences.v1`. First use shows starter data; the optional richer demo creates records relative to the current date.

Reads validate the full household, including names, dates, amounts, splits, recurrence, and linked records. Malformed saved data is preserved rather than overwritten. If corruption appears after a valid session has loaded, the session retains its last known valid state while blocking writes. Replacing the saved value with valid records permits recovery. Failed writes preserve both the current state and any available Undo.

Storage events read the current saved value rather than trusting a queued event's older payload. A genuinely different snapshot clears Undo and updates the tab. An old event with no new snapshot preserves Undo. Removal and clearing of household storage are also handled.

A stale save or Undo accepts the latest valid state and asks the user to review and retry. Comparing a snapshot and writing browser storage are separate synchronous operations: this protects against known stale snapshots, but it is not an atomic transaction between tabs writing at the same instant.

Undo stores one previous successful command in memory. A new successful change replaces it; reloads and genuine external changes clear it. It is not a durable audit log or backup.

Data belongs to one browser and site origin. There are no accounts, household invitations, access permissions, cross-device synchronization, or export/import backups. A shared backend and authentication are needed before this serves multiple households or users on different devices.

## Language, theme, and currency

Preferences persist and synchronize between tabs. The provider updates the document's language, direction, color scheme, and theme, while shared formatters read the selected locale/currency. Arabic uses a Gregorian locale with Latin digits; saved names and titles remain as entered. Theme colors use shared CSS variables, and layout spacing uses logical start/end properties for RTL.

Form drafts retain the currency in which their amount was entered, so changing display currency while a form is open does not reinterpret an existing draft as a different amount. Unchanged edited values retain their original SAR cents.

## Validation and deployment

`npm test` uses Node's native TypeScript support for domain tests. `npm run build` performs strict TypeScript checks and creates `dist`. Chrome workflow tests run against either the development server or the built application through `npm run test:e2e:production`.

Browser scenarios cover linked records, rounding, recurrence, storage failures/recovery, queued tab updates, Arabic/English layouts down to 320px, and failed page downloads. [GitHub Actions](../.github/workflows/ci.yml) runs formatting, lint, unit tests, the production build, and Chrome scenarios on pushes and pull requests using Node.js 24. See the [project review](../PROJECT_REVIEW.md) for recorded results.

Deployment requires publishing `dist` and configuring history fallback: application routes such as `/expenses` must return `index.html`, while asset files must be served normally. Vite development/preview provide this locally. This repository does not configure a hosting service or deployment pipeline.

Further reading: [Interview guide](INTERVIEW_GUIDE.md), [project review — العربية](../PROJECT_REVIEW.md), and [generated asset provenance](../src/assets/roomie-backgrounds.md).
