# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Healthcare staff certificate management and training system (Blood Transfusion and Hematology Hospital). Built with Next.js 16, React 19, TypeScript (strict mode), Tailwind CSS 4, and shadcn/ui (base-nova style). Backend: Supabase (auth + PostgreSQL).

**Active development**: Phase 1 (Core HR + Cert-Checker/Training) is substantially complete with 28 domain modules and full CRUD for both mobile `(app)` and desktop `dashboard` route groups. Phase 2-5 (Attendance, Shifts, Performance, Recruitment, Payroll) are designed in the DB schema but not yet built in the frontend.

**Reference documents** in `documents/`:

- `database-schema.sql` — Full Supabase migration (~2500+ lines, all 9 modules)
- `system-design.md` — RBAC design, module architecture, phasing (Vietnamese)
- `token-lifecycle.md` — Token refresh scenarios (Vietnamese)
- `seed-data-phase1.sql` — Phase 1 seed data
- `seed-accounts.sql` — Test account seeding

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build (includes type checking)
pnpm build:webpack    # Production build (webpack bundler)
pnpm start            # Start production server
pnpm lint             # ESLint (no auto-fix)
pnpm typecheck        # Standalone type checking (tsc --noEmit)
pnpm format           # Format TS/TSX files with Prettier
pnpm format:all       # Format ALL files with Prettier
pnpm format:src       # Format only src/ files with Prettier
ANALYZE=true pnpm build  # Bundle analysis
```

No test framework configured.

**Setup**: Copy `.env.example` to `.env` and populate `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` (for admin operations like creating auth users).

## Architecture (Flattened)

### Directory Structure

```
src/
├── app/[locale]/              # Next.js App Router (53 pages, 4 layouts)
├── actions/                   # Server actions (11 files: attachments, audit-log, auth, ce-entries, completion-evidences, course-registrations, employees, notifications, policy-compliance, reports, transfer-history)
├── queries/                   # React Query hooks + mutations (27 files, one per domain)
├── validations/               # Zod schemas + entity types + form options (28 files)
├── supabase/                  # Supabase infrastructure
│   ├── clients/
│   │   ├── browser.ts         # Browser client
│   │   ├── server.ts          # Server client with cookie handling
│   │   ├── middleware.ts      # Middleware client (extracted from proxy.ts)
│   │   └── admin.ts           # Admin client (service role key, bypasses RLS)
│   ├── realtime.ts            # Realtime subscription helper
│   └── storage.ts             # File upload/delete/getPublicUrl
├── components/
│   ├── ui/                    # shadcn/ui components (base-nova style)
│   ├── shared/                # Shared components (21 components + data-table/)
│   ├── forms/                 # Form components (22 domain forms + 2 auth forms)
│   ├── layouts/               # Layout shells — flat files per layout (app-shell, dashboard-shell, app-sidebar, user-menu, command-palette, dashboard-settings)
│   └── providers/             # App/Theme/Layout providers
├── hooks/                     # Shared hooks (useCurrentEmployee, useRoleCheck, useManagedDepartments, useFullscreen, useMutationObserver, useIsMobile)
├── lib/
│   ├── utils.ts               # cn() utility
│   ├── query-client.ts        # TanStack Query client factory
│   ├── query-helpers.ts       # createQueryKeys() helper
│   ├── supabase-helpers.ts    # Pagination/count helpers
│   ├── breadcrumb-config.ts   # Breadcrumb route config
│   ├── format.ts              # Date/currency/phone formatters
│   ├── export-excel.ts        # XLSX report generation
│   └── constants/             # Domain constants (22 files: status maps, options, for selects)
├── config/app.ts              # Environment validation (Zod)
├── i18n/                      # next-intl config (navigation, request, routing)
├── types/index.ts             # Non-Zod types (User, UserProfile)
└── proxy.ts                   # Middleware (i18n → auth → RBAC)
```

**Import rule**: Flat imports — no layered restrictions. Import directly from the module you need (e.g., `@/queries/departments.queries`, `@/validations/department.schema`).

### Two Route Groups (CRITICAL)

The app has two completely separate route groups with different audiences, layouts, and i18n behavior:

| Aspect       | `(app)`                                         | `dashboard`                                                |
| ------------ | ----------------------------------------------- | ---------------------------------------------------------- |
| **Audience** | All roles (STAFF and up)                        | MANAGER+ only (enforced in middleware)                     |
| **Layout**   | Mobile-first (`AppShell` — header + bottom nav) | Desktop-first (`DashboardShell` — sidebar + header)        |
| **i18n**     | Enabled — use `useTranslations()`               | **Vietnamese only — NO i18n** (hardcode tiếng Việt)        |
| **Layout**   | `src/components/layouts/app-shell/`             | `src/components/layouts/dashboard-shell/` + `app-sidebar/` |

**`(app)` pages** (mobile, all roles, i18n):
`/` home, `/ce-entries` (list/[id]/new), `/certificates` (list + scopes/new/[id] + training/new/[id]), `/courses` (list/[id]), `/evidences` (list/[id]/new), `/my-training` (dashboard + history), `/notifications`, `/profile`, `/registrations` (list/[id]/new)

**`dashboard` pages** (desktop, MANAGER+, Vietnamese only):
`/` overview, `/employees` (list/[id] with tabs: certificates, contracts, dependents, scopes, transfers), `/courses` (list/[id]), `/course-sessions`, `/employee-courses`, `/ce-entries`, `/completion-evidences`, `/course-registrations`, `/hours-records`, `/notifications`, `/notification-templates`, `/policy-compliance`, `/reports`, `/audit-logs`, `/system-settings`, `/profile`
ADMIN-only: `/departments`, `/positions`, `/contract-types`, `/training-categories`, `/participation-types`, `/training-policies` (list/[id]), `/attachments`

### Domain Module Pattern

Each domain (e.g., departments) has files spread across these directories:

| File                | Location                                     | Content                                                                |
| ------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| Validation + types  | `src/validations/department.schema.ts`       | Entity interface, enums, Zod form schema, FormValues type, formOptions |
| Queries + mutations | `src/queries/departments.queries.ts`         | Query keys, useQuery hooks, useMutation hooks                          |
| Constants           | `src/lib/constants/departments.constants.ts` | Status maps (for StatusBadge), option arrays (for selects)             |
| Form component      | `src/components/forms/department-form.tsx`   | "use client" form UI with TanStack Form                                |
| Server actions      | `src/actions/departments.actions.ts`         | "use server" functions (9 domains have actions)                        |

**28 domain modules**: auth, attachments, audit-logs, ce-entries, completion-evidences, contract-types, course-registrations, courses, course-sessions, departments, dependents, employee-courses, employee-department-scopes, employees, employment-contracts, hours-records, notification-templates, notifications, participation-types, policy-compliance, positions, practice-scopes, reports, system-settings, training-categories, training-certificates, training-policies, transfer-history

### Routing & i18n

- **App Router**: All pages under `src/app/[locale]/`. Locales: `en`, `vi` (default: `vi`). Managed by `next-intl`. Messages in `messages/{locale}.json`.
- **Route groups**: `(auth)` for login/register/forgot-password/reset-password, `(app)` for mobile-first pages, `dashboard/` for desktop admin. Top-level `/error` page for auth error callbacks.
- **Route params**: All params use `params: Promise<{locale: string}>` — unwrap with `await` in Server Components or React 19's `use()` in Client Components.
- **Every layout** must call `setRequestLocale(locale as Locale)` for server-side i18n.
- **Navigation helpers**: Use locale-aware `Link`, `redirect`, `useRouter`, `usePathname` from `@/i18n/navigation` (NOT from `next/link` or `next/navigation`).
- **Type safety**: `global.d.ts` extends `next-intl` module with message types from `messages/vi.json`.
- **Path alias**: `@/*` maps to `src/*`.

### Middleware (`src/proxy.ts`)

Triple-layered middleware: i18n routing → Supabase auth → RBAC role checks.

- Uses `createMiddlewareClient()` from `@/supabase/clients/middleware`. Must call `supabase.auth.getClaims()` immediately after client creation — no code between them.
- Unauthenticated users → redirected to `/login` (except `/login`, `/register`, `/confirm`, `/error`).
- Authenticated users on auth pages → redirected to `/`.
- **Role-based route protection**: Routes matched by prefix in `ROUTE_MIN_ROLE` array. ADMIN routes: departments, positions, contract-types, training-categories, participation-types, training-policies, attachments. Catch-all: `/dashboard` requires MANAGER minimum. Insufficient role → redirected to `/`.

### Data Layer

- **Supabase**: Client helpers in `src/supabase/clients/` — `browser.ts` (browser), `server.ts` (server with cookie handling), `middleware.ts` (middleware), `admin.ts` (service role key, bypasses RLS). Server client: `await createClient()`. Browser client: `createClient()`. Admin client: `createAdminClient()` — use ONLY in server actions for admin operations (e.g., creating auth users, banning users).
- **Data fetching**: TanStack React Query. Prefetch in Server Components with `queryClient.prefetchQuery()` → hydrate via `<HydrationBoundary>`. Use `getQueryClient()` from `@/lib/query-client`. Note: SSR `getQueryClient()` has `staleTime: 60s`; client `AppProvider` uses TanStack defaults (0ms) — expect refetches on mount.
- **Query keys**: Use `createQueryKeys()` from `@/lib/query-helpers` for consistent key factories per feature. Returns `{ all, lists, list(filters), details, detail(id) }`.
- **State management**: Zustand for client state, `nuqs` for URL query state.
- **Form handling**: TanStack React Form + Zod validation.
- **Auth flow**: Server actions in `src/actions/auth.actions.ts`. Email confirmation via `(auth)/confirm/route.ts`. Dashboard `layout.tsx` guards with `supabase.auth.getUser()`.
- **Middleware**: Uses `createMiddlewareClient()` from `@/supabase/clients/middleware` in `proxy.ts`.
- **File upload**: `uploadFile()`, `deleteFile()`, `getPublicUrl()` from `@/supabase/storage`.
- **Realtime**: `useRealtimeInvalidation()` from `@/supabase/realtime` — auto-invalidates query cache on DB changes.
- **Reports**: `src/lib/export-excel.ts` generates multi-sheet XLSX files using the `xlsx` library.

### Shared Hooks

- `useCurrentEmployee()` from `@/hooks/use-current-employee` — Fetches current user's employee record (id, role, department) via TanStack Query with 5min staleTime.
- `useRoleCheck()` from `@/hooks/use-role-check` — Returns `{ role, isAdmin, isSuperAdmin, isManager, isAdminOrAbove, isManagerOrAbove, employeeId, departmentId }` derived from `useCurrentEmployee()`.
- `useManagedDepartments()` from `@/hooks/use-managed-departments` — Fetches departments managed by current MANAGER user via `employee_department_scopes`.
- `useFullscreen()` from `@/hooks/use-fullscreen` — Fullscreen API wrapper.
- `useMutationObserver()` from `@/hooks/use-mutation-observer` — DOM mutation observer.
- `useIsMobile()` from `@/hooks/use-mobile` — Breakpoint 768px.

### Database Schema Conventions

All tables follow these conventions (see `documents/database-schema.sql`):

- **UUID PKs**: `id uuid primary key default gen_random_uuid()`
- **Timestamps**: `timestamptz` (never `timestamp`), auto-updated via `set_updated_at()` trigger
- **Text fields**: `text` (never `varchar`) — no length limits
- **Money**: `numeric(15,2)`
- **Enums**: `text + CHECK constraint` (not PostgreSQL `ENUM` type)
- **Soft delete**: `deleted_at timestamptz` column + partial indexes (`WHERE deleted_at IS NULL`). All queries must filter `deleted_at IS NULL`.
- **Auth linkage**: `employees.auth_id` → `auth.users(id)`
- **Extensions**: `pgcrypto`, `pg_trgm` (text search), `btree_gist` (range exclusion)

**Database modules** (9 modules, ~80+ tables):

| Module                   | Key tables                                                                            | Count |
| ------------------------ | ------------------------------------------------------------------------------------- | ----- |
| Core HR                  | departments, positions, employees, employment_contracts, dependents, transfer_history | 11    |
| Cert-Checker/Training    | courses, course_sessions, employee_courses, training_policies, hours_records          | 14    |
| Attendance & Leave       | leave_types, leave_requests, attendance_records, monthly_attendance_summaries         | 6     |
| Shift Management         | shifts, shift_templates, employee_shift_assignments, overtime_requests                | 6     |
| Performance Evaluation   | evaluation_templates, evaluation_periods, evaluation_sheets, evaluation_scores        | 8     |
| Rewards & Discipline     | rd_types, rd_proposals, rd_records                                                    | 4     |
| Recruitment & Onboarding | recruitment_requests, job_postings, candidates, offers, onboarding_checklists         | 11    |
| Document Management      | document_types, document_records, document_requests                                   | 3     |
| Payroll & Compensation   | salary_grades, allowance_types, deduction_types                                       | 9     |

**Key stored procedures**: `approve_leave_request(uuid)` (atomic with `FOR UPDATE`), `sync_employee_contract_type()`, `check_no_self_propose()`.

**RLS helpers**: `get_my_employee_id()`, `is_admin_or_above()`, `get_my_managed_department_ids()`. All security-definer functions use `set search_path = ''`.

### RBAC Roles

Defined via `employees.system_role`:

| Role         | Scope             | Access                                                 |
| ------------ | ----------------- | ------------------------------------------------------ |
| `SUPERADMIN` | Global            | Full system, manages ADMINs                            |
| `ADMIN`      | Hospital-wide     | HR operations (Phòng Tổ Chức Cán Bộ), CRUD employees   |
| `MANAGER`    | Department-scoped | Limited to departments in `employee_department_scopes` |
| `STAFF`      | Self only         | Personal data and own requests                         |

**Critical**: MANAGER queries must always be scoped via `employee_department_scopes`. Self-approval prevention is enforced universally (CHECK constraints + triggers on leave, evidence, course registration, rewards/discipline).

### Provider Nesting Order (root layout)

NextIntlClientProvider → ThemeProvider → TooltipProvider → LayoutProvider → AppProvider (QueryClient + NuqsAdapter)

### UI Components

- **shadcn/ui** in `src/components/ui/` (base-nova style, Tabler icons). Config: `components.json`.
- **Shared components** in `src/components/shared/`: AttachmentPreviewDialog, AttachmentSection, ConfirmDialog, DatePickerInput, DetailPageSkeleton, DynamicBreadcrumb, EmptyState, FileUpload, FormSheet, ImageViewer, LayoutSwitcher, LoadingButton, LocaleSwitcher, NotificationBell, PageHeader, PasswordInput, PdfViewer, ProgressRing, StatusBadge, ThemeSwitcher, UserAvatar.
- **Data table system** in `src/components/shared/data-table/` — drag-drop (dnd-kit), inline editing, bulk actions, pagination, column headers, row actions.
- **Command Palette**: `Ctrl+K`/`Cmd+K`. `SearchProvider` from `@/components/layouts/command-palette` wraps dashboard.
- **Layout system**: `LayoutProvider` from `@/components/providers/layout-provider` manages "fixed" vs "full" width, persisted to localStorage.
- **Font**: Noto Sans (Google Fonts, variable: `--font-sans`).

### Key Libraries

`date-fns` (dates), `recharts` (charts), `xlsx` (Excel export), `react-resizable-panels` (panels), `dompurify` (XSS sanitization), `vaul` (drawer), `usehooks-ts` (utility hooks), `motion` (animations), `cmdk` (command palette), `embla-carousel-react` (carousel), `react-dropzone` (file upload), `input-otp` (OTP input), `nextjs-toploader` (top loading bar), `query-string` (URL parsing), `@base-ui/react` (Base UI).

### Build Config

- **React Compiler** enabled in `next.config.mjs`. Dev indicators disabled (`devIndicators: false`).
- **Environment validation**: Zod schema in `src/config/app.ts`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`. Optional: `SUPABASE_SERVICE_ROLE_KEY` (needed for admin operations).
- **Console removal**: Production strips `console.log`/`console.info`, keeps `console.error`/`console.warn`.
- **Image remote patterns**: Only `localhost` configured. Add Supabase Storage domain when deploying to production.

## Code Style

- **Prettier**: 100 char width, 2-space indent, trailing commas everywhere (`"all"`), Tailwind class sorting, `endOfLine: "lf"` (on Windows, ensure Git `autocrlf=false`). Import sorting via `@ianvs/prettier-plugin-sort-imports` (TypeScript-native parser). Import groups: node builtins → React/Next → third-party → `@/components/ui` → `@/components` → hooks → lib → actions → supabase → queries → validations → config/types → relative.
- **ESLint**: Flat config (`eslint.config.mjs`). Rules: `next/core-web-vitals`, `next/typescript`, `@tanstack/eslint-plugin-query` (enforces TanStack Query patterns), `eslint-config-prettier` (no Prettier conflicts).
- Client components must use `"use client"` directive. Prefer Server Components by default.
- Tabler Icons exclusively (`@tabler/icons-react`). No Lucide, no Heroicons.
- Colors use OKLCH color space in CSS custom properties. Brand colors: `--bth-primary`, `--bth-secondary`.

## Patterns & Conventions

### TanStack Form + Zod 4 Compatibility (CRITICAL)

Using **Zod 4** (`zod@^4.3.6`). `z.coerce.number()`, `z.preprocess()`, `z.default()` are ALL incompatible with TanStack Form v5's StandardSchemaV1 validator. These Zod wrappers create input types that don't match form's inferred types. **Solution**: Use plain Zod types (`z.number()`, `z.string()`, `z.enum()`) — handle coercion in form `onChange`, defaults in form-options (defined in `validations/*.schema.ts`). Nullable fields in form `defaultValues` must use `null` (not `""`) when schema uses `.nullable()`.

### Base UI Composition (CRITICAL)

shadcn/ui Trigger components default render `<button>`. **Never nest interactive elements** — causes hydration errors. Use `render` prop:

```tsx
// WRONG: nested buttons
<DropdownMenuTrigger><SidebarMenuButton>Menu</SidebarMenuButton></DropdownMenuTrigger>

// RIGHT: render prop
<DropdownMenuTrigger render={<SidebarMenuButton />}>Menu</DropdownMenuTrigger>
```

Same for `<a>` nesting: `<SidebarMenuSubButton render={<Link href="/page" />}>`.

**Button + Link**: `<Button render={<Link href="..." />} nativeButton={false}>` — must add `nativeButton={false}` since Link renders `<a>`, not `<button>`.

### CRUD Table Pages

Reference implementation at `src/app/[locale]/dashboard/example/`. Structure:

```
src/app/[locale]/dashboard/{feature}/
├── _components/{feature}-table.tsx   # "use client" — columns + table
├── _data/{feature}-table.ts          # Mock/static data
└── page.tsx                          # Server Component
```

### Styling

- Custom Tailwind 4 variants: `@custom-variant dark`, `@custom-variant fixed` (matches `.layout-fixed` class on `<html>`, set by `LayoutProvider`).
- Extra breakpoints: `3xl: 1600px`, `4xl: 2000px`.
- Theme switcher uses View Transition API (`document.startViewTransition()`).
- Layout toggle: `useLayout()` from `@/components/providers/layout-provider` — "fixed" or "full" width, persisted to localStorage key `"layout"`.

### Forms & Tables

- TanStack React Form + Zod. Validation: `field.state.meta.isTouched && !field.state.meta.isValid`.
- Data tables: `@dnd-kit/*` for drag-to-reorder, inline editing, multi-select rows, column visibility toggle.
- Toast feedback via Sonner (`toast.promise` for async operations).

### Supabase Workflows

- **Server actions**: Use `await createClient()` from `@/supabase/clients/server` inside `"use server"` functions. Always check for errors from Supabase responses.
- **Client queries**: Use `createClient()` from `@/supabase/clients/browser` inside TanStack Query hooks.
- **Prefetch pattern**: In Server Components, use `queryClient.prefetchQuery()` → wrap children with `<HydrationBoundary state={dehydrate(queryClient)}>`.
- **Mutations**: Use `useMutation` with `onSuccess` → `queryClient.invalidateQueries()` for cache invalidation. Use `toast.promise` for user feedback.
- **Supabase join casts**: Use `as unknown as Type` for joined relation types returned from Supabase queries.

### Zustand Stores

Co-located with layout components: `src/components/layouts/{layout}/use-{name}.ts`. Pattern: `create<Interface>()(persist(set => ({ ... }), { name: "storage-key" }))`.

### Backward Compatibility Shims

Re-export shims exist at old paths for backward compatibility with `shadcn` CLI (`components.json` uses `@/lib/utils`, `@/hooks`):

| Old path (shim)           | Canonical location     |
| ------------------------- | ---------------------- |
| `src/lib/utils.ts`        | Canonical (not a shim) |
| `src/hooks/use-mobile.ts` | Canonical (not a shim) |

**New code should always import directly from the module path** (e.g., `@/queries/departments.queries`, `@/validations/department.schema`, `@/lib/constants/departments.constants`).
