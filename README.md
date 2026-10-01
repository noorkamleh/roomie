# Roomie - Shared Home Management

Roomie brings shared household expenses, balances, bills, chores, shopping, and members into one place. Built with React, TypeScript, Vite, Tailwind CSS, Recharts, and Lucide icons.

## Features

- Expenses: add, edit, delete, search, select who paid, and choose who shares the cost. Live share previews use integer halalas so the full amount is preserved.
- Balances: derive each member's net balance from expenses and recorded repayments. Suggested transfers show who can pay whom to settle the household.
- Bills: add due dates, filter by pending/due soon/overdue/paid, and record who paid. Paying a bill atomically creates one expense; repeated payment cannot duplicate it.
- Chores: assign tasks, set due dates, and move between pending, in progress, and completed.
- Shopping: add quantities, mark purchased items, filter, and remove items.
- Members: add household members, name the household, and select whose perspective appears on the dashboard.
- Dashboard: current month spending, live balances, pending tasks, upcoming bills, recent expenses, today's chores, and fast add actions. Greeting, time, and dates follow the user's device.
- Persistence: versioned browser storage, validation before updates, storage error messages, and synchronization between tabs on the same origin.

## Run locally

Use Node.js 22.18+ (native TypeScript support is used by the unit tests).

```sh
npm ci
npm run dev
```

## Validation

```sh
npm run format:check
npm run lint
npm test
npm run build
npm run test:e2e
```

Browser tests use installed Google Chrome and start their own Vite server on port 4173. They cover expense sharing, editing/deletion, bill payments, task and shopping status, household settings, repayments, mobile layout, clock changes, malformed storage, and tab synchronization. No backend or external account is needed.

## Architecture

```text
src/
  app/                 Routes, application shell, sidebar and shell styles
  features/
    dashboard/         Overview sections, clock/chart hooks and chart aggregation
    expenses/          Expense forms, list, splitting and balance calculations
    bills/             Bill creation, payments and derived due-date statuses
    chores/            Task creation, assignments and status changes
    shopping/          Shopping list and quantity form
    members/           Member profiles and household overview
    household/         Shared state provider, commands, persistence and validation
  shared/              Reusable UI, hooks, dates/currency formatting, types and demo data
```

Pages compose components; forms handle input; hooks connect state; pure functions implement domain calculations. See `src/AGENTS.md` for project conventions. `src/pages/Dashboard.tsx` is only a compatibility export for the old path.

## Money rules

All amounts are SAR. Splits are calculated in halalas: 100 SAR between three people is 33.34, 33.33, and 33.33. Any remaining halalas are allocated in participant order. The payer does not have to be a participant. Positive balance means money receivable; negative means money owed. Suggested repayments settle net balances; they do not change the expense total. Expense dates control monthly totals; bill and chore due dates use local calendar days.

## Current storage scope

This version is a local frontend application. Data belongs to this browser and site origin, survives reloads, and is shared with other tabs of the same browser. It is not shared between devices or different users. Selecting a member changes the viewing perspective; it is not authentication. Demo data is shown on first use. Future backend integration can replace the household persistence boundary without rewriting the feature UI.

## Suggested next steps

- Authentication and household invitations with a shared backend.
- Recurring bills, reminders and fair chore rotation.
- Export/import backups, monthly budgets and category reports.

Generated background assets and their prompts are documented in `src/assets/roomie-backgrounds.md`.
