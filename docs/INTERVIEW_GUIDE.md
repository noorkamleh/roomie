# Interview guide

Use this guide to demonstrate the working application and discuss the engineering decisions behind it. The project is a browser-only frontend; describe member selection as a viewing perspective rather than a login or permission system.

## A short demo

Start the app with the [README instructions](../README.md). In **Members → Household**, select **Load demo data** to show dated activity, bills, chores, purchases, and settlements. This replaces the current browser household and offers immediate Undo.

1. **Dashboard:** show household spending, personal share, balances, and upcoming work. Explain why future chart dates are empty rather than zero spending.
2. **Expenses:** filter the ledger, switch between cards/list, and add 100 SAR split among three members. Show the 33.34/33.33/33.33 split, then try exact or percentage shares and their validation.
3. **Balances:** record a partial repayment and show its effect on balances and history. Explain why a repayment does not increase household spending.
4. **Linked workflows:** pay a recurring bill or record a shopping purchase. Show the created expense, the preserved source record, and Undo of the whole action.
5. **Preferences:** switch to Arabic, dark theme, and dollars. Show RTL navigation and unchanged stored amounts. Open a second tab in the same browser to demonstrate synchronization.

For a longer demo, show a chore's rotating assignment and swap request, archive a member while retaining their history, or compare actual spending with a monthly/category budget.

## Code walkthrough

| Topic                 | Start here                                                                                                                                                                                                                   | What to explain                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Feature boundaries    | [AppRoutes.tsx](../src/app/AppRoutes.tsx), [Expenses.tsx](../src/features/expenses/pages/Expenses.tsx)                                                                                                                       | Lazy routes and pages that compose feature components.                               |
| Financial correctness | [calculations.ts](../src/features/expenses/utils/calculations.ts)                                                                                                                                                            | Integer halalas, basis points, deterministic rounding, and derived balances.         |
| Currency entry        | [currencyShares.ts](../src/features/expenses/utils/currencyShares.ts), [preferences/model.ts](../src/shared/preferences/model.ts)                                                                                            | Exact conversion and allocation; preserving cents hidden by dollar display.          |
| A complete command    | [household.ts](../src/features/household/model/household.ts)                                                                                                                                                                 | A bill payment or shopping purchase creates a complete validated next state.         |
| Persistence and Undo  | [persistence.ts](../src/features/household/model/persistence.ts), [history.ts](../src/features/household/model/history.ts)                                                                                                   | Persist before publishing; reject stale snapshots; retain state after failed writes. |
| Regression coverage   | [currencyShares.test.mjs](../src/features/expenses/tests/currencyShares.test.mjs), [storageSafety.test.mjs](../src/features/household/tests/storageSafety.test.mjs), [reliability.spec.js](../tests/e2e/reliability.spec.js) | Domain invariants plus browser tests of 320px layouts and chunk-load recovery.       |

## Decisions to discuss

- **Integer money:** whole cents and explicit remainder rules make splits reproducible and testable. Binary decimal arithmetic should not decide who receives the last halala.
- **Commands and UI:** forms describe the user's action; the reducer owns relationships and validation. A linked workflow can update several record lists together and Undo can restore them together.
- **Unchanged edits:** a stored 0.01 SAR amount rounds to $0.00 for display. Saving a title change should retain that original cent rather than convert the rounded display back to zero.
- **Production tests:** development and production load modules differently. The same workflows run against `dist`, including a simulated page-download failure and its reload recovery.
- **Tab protection:** a known stale snapshot is rejected and refreshed. Browser comparison plus write is not an atomic cross-tab transaction; simultaneous writes need transactional storage or a backend.

## Boundaries and next steps

The current app has no backend, accounts, invitation flow, cross-device sharing, export/import backups, or configured hosting. These are concrete extensions rather than existing features. First priorities for shared real-world use would be household identity/access control, server persistence with concurrency checks, and backup/restore.

Further product work could add reminders and a repeat-purchase action that creates a new shopping item while preserving its earlier purchase record. Image optimization would reduce the weight of decorative assets; the [CI workflow](../.github/workflows/ci.yml) already automates the source and production-browser checks.

See [Architecture and domain rules](ARCHITECTURE.md) for detail and [the Arabic project review](../PROJECT_REVIEW.md) for recorded validation results and remaining work. [Asset provenance](../src/assets/roomie-backgrounds.md) documents the generated illustrations.
