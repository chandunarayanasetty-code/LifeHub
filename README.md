# LifeHub

**One calm place for tasks, calendar, money, habits, notes, and goals.**

LifeHub is a personal life-management app built in public, one phase at a time.
This repository currently contains **Phase 2: a working Tasks module** on top of
the Phase 1 foundation and dashboard.

> **Data honesty.** Tasks you create are saved to a local JSON file on the
> machine running the app (`.data/tasks.json`). Everything else — calendar,
> money, habits, notes, goals, activity, and notifications — is still generated
> sample content from `src/lib/mock-data.ts`. No account exists, nothing is in a
> database yet, and **no figure is a real financial record**. The interface says
> so in the app; please keep that honest labelling if you fork it.

![LifeHub Tasks in light mode](docs/tasks-light.png)

<details>
<summary>Tasks in dark mode</summary>

![LifeHub Tasks in dark mode](docs/tasks-dark.png)

</details>

<details>
<summary>Phase 1 dashboard</summary>

![LifeHub dashboard in light mode](docs/lifehub-light.png)

![LifeHub dashboard in dark mode](docs/lifehub-dark.png)

</details>

## What works today

- **Responsive app shell** — desktop sidebar at 1024px and above, a slide-out
  navigation drawer below that, and a five-item bottom bar on phones.
- **Tasks that actually save** — create, edit, complete/reopen, and delete tasks.
  Every mutation is a server action that re-validates with Zod, writes to the
  local task file, and revalidates the task page and dashboard.
- **Filters and sorting** — full-text search across titles, descriptions,
  categories, and tags; status tabs with live counts; priority and category
  filters; and due date, newest, priority, or title sorting. Filters live in the
  URL, so a filtered view can be bookmarked or refreshed.
- **Task details** — title, description, status, priority, category with
  suggestions, due date and time, and up to eight tags. Overdue, due-today, and
  tomorrow labels are computed from the due date.
- **Local persistence** — tasks survive a server restart in `.data/tasks.json`.
  Restore the original sample tasks any time from Settings.
- **Dashboard awareness** — today's tasks, due-today counts, completion stats,
  the weekly productivity chart, and global search all read the same stored task
  records, so an edit appears everywhere.
- **Derived metrics** — totals are calculated from records in
  `src/lib/dashboard.ts`; they are not hard-coded into the page.
- **Global search** — `Ctrl+K` / `⌘K` or the search button opens a command
  palette over saved tasks and sample notes.
- **Theme switching** — light, dark, and system themes via `next-themes`,
  selectable from the top bar, the mobile drawer, and Settings.
- **Honest module states** — Notes remains a read-only sample; Notifications
  lists sample reminders. Calendar, Expenses, Habits, Goals, and Reports show an
  explicit "not built yet" roadmap page instead of fake buttons.
- **Supporting UI** — loading skeleton, error boundary, 404 page, skip link,
  focus-visible rings, reduced-motion support, and a branded app icon.

### Deliberately not built yet

PostgreSQL/Prisma persistence, authentication, per-user data isolation, the
Calendar, Expenses, Habits, Notes, and Goals modules, reports, automated tests,
and deployment automation. Buttons that depend on those features are either
disabled or labelled with the phase that will deliver them.

## Tech stack

| Layer       | Choice                                                     |
| ----------- | ---------------------------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack, Server Actions)         |
| Language    | TypeScript, `strict` mode                                  |
| UI          | React 19, Tailwind CSS v4, shadcn/ui on Base UI            |
| Icons       | Lucide React                                               |
| Charts      | Recharts                                                   |
| Validation  | Zod (shared by forms and server actions)                   |
| Storage     | Local JSON file in Phase 2                                 |
| Theming     | `next-themes`                                              |
| Future      | PostgreSQL, Prisma, Vitest, Playwright, deployment          |

## Getting started

Requirements: **Node.js 20.9 or newer** and npm.

```bash
git clone https://github.com/chandunarayanasetty-code/LifeHub.git
cd LifeHub
npm install
npm run dev
```

Open <http://localhost:3000>.

The first request to `/tasks` creates `.data/tasks.json` and seeds it with the
sample tasks from `src/lib/mock-data.ts`. The file is ignored by git. To start
over, use **Settings → Task storage → Restore sample tasks**.

### Scripts

| Command             | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the development server                 |
| `npm run lint`      | Run ESLint                                   |
| `npm run typecheck` | Run TypeScript without emitting files        |
| `npm run build`     | Production build (also type-checks)          |
| `npm start`         | Serve the production build locally           |

Phase 2 is verified with `npm run lint`, `npm run typecheck`, and
`npm run build`.

## Project structure

```text
src/
  app/
    (app)/                  # App shell shared by every dashboard page
      layout.tsx            # Sidebar, top bar, mobile navigation
      page.tsx              # Dashboard (reads stored tasks)
      tasks/page.tsx        # Working task list, filters, and stats
      notes/                # Read-only preview
      notifications/        # Read-only preview
      settings/             # Theme selector + task storage reset
      calendar/             # Roadmap placeholders
      expenses/
      habits/
      goals/
      reports/
    layout.tsx              # Fonts, metadata, theme provider
    globals.css             # Design tokens, dark theme, utilities
    icon.svg                # App icon
    not-found.tsx
  components/
    dashboard/              # Stat cards, charts, lists, roadmap
    layout/                 # Sidebar, drawer, top bar, search, menus
    settings/               # Theme selector, reset-task-data button
    tasks/                  # Task form, row actions, filters, badges
    ui/                     # shadcn/ui primitives
  hooks/
  lib/
    tasks/
      schema.ts             # Zod schemas, labels, form helpers
      store.ts              # Serialized JSON file reads/writes + seeding
      repository.ts         # create/update/status/delete/reset API
      query.ts              # URL filters, counts, sorting, href builders
      actions.ts            # Server actions for every mutation
      action-types.ts       # Serialisable form-action state
    mock-data.ts            # Generated sample records (tasks are seed data)
    dashboard.ts            # Derived dashboard metrics
    date.ts                 # Timezone-safe date helpers
    format.ts               # Currency, number, and date formatting
    navigation.ts           # Navigation model and page titles
    search.ts               # Search index for tasks and notes
    types.ts                # Shared domain types
docs/                       # README screenshots
.data/tasks.json            # Local task records (created at runtime, gitignored)
```

## How task storage works

Phase 2 deliberately stops short of a database, but it does not pretend to be
one:

- **One file, one user.** `src/lib/tasks/store.ts` reads and writes
  `.data/tasks.json`. There is no per-user scoping, no backup, and no migration
  history.
- **Serialized writes.** In-process reads and writes are queued so two server
  actions cannot interleave a read-modify-write cycle. A real database would
  handle this with transactions.
- **Validated on write.** Every stored record is parsed with the same Zod shape
  the UI uses. If the file becomes unreadable, it is backed up to
  `tasks.json.corrupt-<timestamp>.json` and reseeded rather than silently
  overwritten.
- **Not production-safe.** A single JSON file will not work reliably on
  multi-instance or serverless hosting. Phase 3 replaces `store.ts` and
  `repository.ts` with Prisma and PostgreSQL. Pages and components call the
  repository, not the file, so the UI contract should not need to change.

## How the sample data works

- Tasks are seeded once from `src/lib/mock-data.ts`, then become real stored
  records. Their dates stay as saved until you reset them.
- Calendar, money, habit, note, goal, activity, and notification records are
  still generated **relative to the current date**, so those preview screens
  never look stale.
- Money is stored as integer cents (`amountCents`) to avoid floating-point
  rounding errors. Formatting happens only at the edge, in `src/lib/format.ts`.
- Dates use local-time helpers in `src/lib/date.ts`, including a Monday week
  start and `YYYY-MM-DD` keys for habit check-ins.
- Pages that read "today" opt into dynamic rendering
  (`export const dynamic = "force-dynamic"`). No preview record is cached at
  build time.

## Roadmap

| Phase | Scope                                                        | Status |
| ----- | ------------------------------------------------------------ | ------ |
| 1     | Foundation, responsive shell, dashboard, mock data, themes    | Done   |
| 2     | Tasks: create, edit, complete, delete, filters, validation    | Done   |
| 3     | PostgreSQL, Prisma schema, migrations, seed data               | Next   |
| 4     | Authentication, sessions, per-user ownership checks            | Planned|
| 5     | Calendar, Expenses, Habits, Notes, Goals modules               | Planned|
| 6     | Reports, in-app notifications, synced preferences              | Planned|
| 7     | Vitest unit/integration tests, Playwright E2E, a11y audit      | Planned|
| 8     | CI, production database, deployment, monitoring                | Planned|

Every phase is expected to finish with lint, type-check, and a production build
before the next one starts.

## Verification notes

Phase 2 was checked in real Chrome at 375, 390, 768, 1024, and 1440 CSS pixels:

- Full task lifecycle: create, server-side validation failure, edit, complete,
  filter, and delete.
- Form values survive a failed validation round-trip; React 19's automatic form
  reset no longer erases the user's input.
- Search, status tabs, priority/category filters, sorting, and the empty state
  behave correctly, and filter state survives a page refresh.
- Settings restores the sample task list and the restored records appear across
  the task page and dashboard.
- `?intent=create` opens the task form from the dashboard and quick-add links.
- No horizontal overflow at any tested width; the task dialog stays inside the
  viewport and scrolls internally on short screens.
- All routes render without console errors. Dark mode was checked for the task
  page and dialog.

Phase 1 remains verified at the same widths for navigation, theming, search,
menus, and route rendering.

There is no committed automated test suite yet; Vitest and Playwright arrive in
Phase 7. The checks above were run with temporary Playwright scripts and
headless Chrome.

## Deployment

The app builds as a standard Next.js project:

```bash
npm run build
npm start
```

Phase 2's JSON file storage assumes a long-lived filesystem and a single app
instance. Before deploying to Vercel or any multi-instance host, complete Phase
3 so tasks live in PostgreSQL. No environment variables are required yet;
`.env.example` documents the variables later phases will need.

## Author

Built by [Chandra Narayana](https://github.com/chandunarayanasetty-code).
