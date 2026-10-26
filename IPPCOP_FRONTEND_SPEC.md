# IPPCOP Frontend Prototype — Build Instructions

> Hand this file to the coding agent. Put it at the repo root (rename to `AGENTS.md`, `CLAUDE.md` or `.cursorrules` if your IDE expects that).
> Build in the phases listed at the end. Finish and verify each phase before starting the next.

---

## 1. What you are building

**Project:** Industrial Production Planning and Cost Optimization Platform (IPPCOP), a decision-support platform for a home-appliance manufacturer. The real system will combine demand forecasting, BOM explosion, capacity modelling, a MILP optimization engine, scenarios, explainability and role-based governance.

**This task:** a **frontend-only, non-working prototype** of the presentation layer. It exists so university supervisors can see how the platform will look and behave at a mid-project evaluation.

Hard rules:

1. **No backend.** No API calls, no server, no database, no environment secrets. Everything runs in the browser from typed mock data.
2. **No real AI.** The chat assistant is scripted (keyword/intent matching with canned replies). Never call an LLM.
3. **Not the final product.** It must look convincing but must not claim to be real. Show a persistent **"Prototype — mock data"** banner.
4. **No real company data.** All names and numbers are invented and illustrative. Do not use real model numbers, supplier names or confidential figures. Do not present savings as guaranteed.
5. **Keep it simple.** Do not add auth libraries, state machines libraries, form frameworks or anything not listed in the stack.

---

## 2. Stack

- Vite + React + TypeScript (strict mode)
- Tailwind CSS + shadcn/ui (use whichever Tailwind version the shadcn init sets up)
- React Router
- Fonts: system font stack, or a locally bundled font. No network font requests.

The Gantt chart is built with **CSS grid and absolutely positioned bars**, not a Gantt library.

Target: desktop/laptop at 1280 px and wider (it will be shown on a projector). Mobile is not required.

---

## 3. Roles and permissions

Exactly **four roles**. Dawlance's planner reports directly to the production manager, who is the sole accountable person. There are no procurement, finance or executive users.

| Role | Responsibilities | Authority |
|---|---|---|
| **Admin** | Users and roles, master-data configuration, cost parameters, audit access | System configuration only. Cannot approve plans |
| **Planner** | Reviews demand, runs optimizations, builds scenarios, applies overrides with a reason, submits plans | Submits plans for approval |
| **Production Manager** | Reviews plans, scenarios, cost and KPIs. Sole approver | Approves or rejects plans |
| **Inventory** | Uploads inventory spreadsheets, checks validation, monitors stock and alerts | None |

Inventory uploads are manual spreadsheets for now. Show a **disabled "SAP connection — planned"** card on the Imports screen to signal later integration. Do not build any SAP logic.

### Screen access (● can act, ○ view only, — hidden)

| Screen | Admin | Planner | Prod. Manager | Inventory |
|---|---|---|---|---|
| Dashboard (own view) | ○ | ○ | ○ | ○ |
| Imports | ● master data | ○ | — | ● inventory spreadsheets |
| Master data | ● | ○ | ○ | — |
| Inventory & demand | ○ | ● demand | ○ | ● stock |
| Material requirements | ○ | ○ | ○ | ○ |
| Plan setup & run | ○ | ● | ○ | — |
| Plan detail (Gantt) | ○ | ● override | ○ | — |
| Approvals | — | ● submit | ● approve / reject | — |
| Scenarios | — | ● | ○ | — |
| Explainability | — | ○ | ○ | — |
| Cost breakdown | ● parameters | ○ | ○ | — |
| Reports | ○ | ● | ● | ● inventory reports |
| Users & roles | ● | — | — | — |
| Audit trail | ○ | — | ○ | — |
| Chat assistant | ● | ● | ● | ● |

**Implementation requirement:** define this matrix **once** in `src/auth/permissions.ts` as typed data. The sidebar, route guards, button enable/disable state and the chat assistant must all read from it. Never hard-code role checks in components.

**Deny by default:** navigating directly to a route the role cannot see renders an **Access Denied** page (not a blank screen, not a redirect).

---

## 4. App shell

- **Login page:** four role cards (name, one-line description). Clicking one signs in as that role. No password fields and no real auth. Show a small note: "Prototype login — no credentials required". Store the session in the Zustand store.
- **Layout:** left sidebar with grouped navigation (Data, Operations, Planning, Analysis, Insight, Admin), top bar, content area.
- **Top bar:** breadcrumb, plant name ("DPL-2"), a **dataset version badge** (e.g. `Dataset v3`), a role badge, and a user menu.
- **User menu:** Switch role (instant, no re-login), Reset demo data, Demo controls (see section 11), Sign out.
- **Persistent banner:** a slim strip reading "Prototype — mock data. Not a reflection of the final product."
- **Chat widget:** floating button bottom-right on every authenticated screen, expanding to a panel. A full-page chat route (`/chat`) shares the same conversation state.
- Hide nav items the role cannot access (per the matrix). Disable (do not hide) action buttons the role may see but not use, with a tooltip explaining why, e.g. "Requires Production Manager approval".

---

## 5. Mock data (single source of truth)

Put all data in `src/mock/` as typed TypeScript. **Every screen reads from this module through selectors** (`src/mock/selectors.ts`). Totals, shortages, utilization and savings must be **computed from line items** so numbers agree on every screen. Never hard-code the same figure in two places.

**Scale (prototype-sized):**
- 1 company, 1 plant, 5 production lines, about 16 machines
- About 14 products across four families: microwaves, water dispensers, air conditioners, washing machines. Use generic names such as "3-Tap Hot & Cold Water Dispenser" with invented SKU codes like `WD-300-HC`. No real model numbers
- About 22 raw materials (steel sheet, copper tubing, compressors, PU foam chemicals, PCBs, motors, plastic granules, packaging, and similar) in 5 categories
- 5 suppliers named "Supplier A" to "Supplier E", each with unit cost, MOQ, lead time and capacity per material
- Multi-level BOM with scrap % and at least one substitute material
- Routing per product with stages **sheet-metal forming → foaming → assembly → QC**, with processing time, setup time and required skill
- Planning horizon: 4 weeks starting **Monday 2 Nov 2026**, daily buckets for the schedule view, weekly buckets for demand. Keep dates configurable in one constant
- Currency PKR, shown with thousands separators and "M" for millions on summary cards
- Demand history: 12 months, with seasonality (higher air-conditioner demand toward summer)

**Plans:**
- A **Baseline plan** (naive/uploaded) and an **Optimized plan** for the same horizon
- Optimized cost must come out **4–8% below baseline**, not dramatically lower
- Utilization mostly 70–92%, with **Line 3 as the clear bottleneck near 97%**
- At least one material shortage and one stock-out risk, so alerts and procurement views have content
- Total cost = ten components: **material, labor, machine, energy, setup, inventory, overtime, shortage, procurement, outsourcing**. The breakdown must sum exactly to the total

**Seed history:** a few past plans in different states (Completed, Approved, Rejected), 3 scenarios (one deliberately infeasible), 15–25 audit-log entries across the four roles, 2 dataset versions already committed, 3 users per role-appropriate sample.

---

## 6. Screens

Group by the architecture. Keep each screen realistic but compact.

### 6.1 Dashboards (one per role, same route, different content)
- **Planner:** current schedule snapshot, last run status, alerts, top material shortages, "Run optimization" shortcut
- **Production Manager:** pending approvals (prominent), utilization by line, bottleneck callout, plus KPI cards: total cost, savings vs baseline (amount and %), demand fulfillment, overtime hours, shortages. This view absorbs what a finance or executive view would show
- **Inventory:** stock positions, stock-out/excess risk list, last upload status, days of inventory
- **Admin:** user count, recent audit entries, dataset version history, import status

### 6.2 Imports (Data)
- Two tabs: **Master data** (Admin) and **Inventory spreadsheets** (Inventory). Show the tab the role is allowed to use; the other is view-only or hidden per the matrix
- Flow: pick import type → drag-and-drop area (accept any file, **do not parse it**) → simulated staging table with row-level validation → summary counts (valid / warnings / errors) with about 3 canned issues (unknown SKU, negative quantity, missing unit) → "Skip invalid rows" → **Commit**
- Commit creates a new **dataset version** (badge increments), writes an audit entry, and visibly changes some mock data (e.g. a stock level changes and an alert appears or clears)
- Show the disabled "SAP connection — planned" card
- Show import history with version numbers

### 6.3 Master data
Tabs: Products, BOM (expandable multi-level tree with version badges and scrap %), Routings, Factory structure (Plant → Area → Line → Work center → Machine tree), Machines and calendars, Workforce and skills, Suppliers. Admin can open an edit drawer; saving appends a new version row (fake). Others see read-only tables. A version-history side panel is enough.

### 6.4 Inventory & demand (Operations)
- **Inventory** (Inventory role acts): positions per SKU (opening, available, reserved, safety stock, closing), alerts for stock-out/excess
- **Demand** (Planner acts): forecast vs confirmed orders by product and week, with a chart
- **Forecast panel:** "Run forecast" runs a fake 2-second job and shows a **model comparison table** (moving average, exponential smoothing, one ML model) with MAPE/WAPE/bias, highlighting the best model, plus a confidence-interval band on the chart. Include the note "ML is used only if it beats the statistical baseline"

### 6.5 Material requirements (read-only)
Required vs available material by period, shortages with quantity and earliest supplier replenishment, and recommended purchases (what, how much, when, from which supplier). It is read-only for everyone because no procurement role exists.

### 6.6 Plan setup & run (Planning)
- Form: plant, horizon, baseline plan, forecast version, objective weights (shortage, overtime, excess-inventory penalties as sliders), solver time limit, MIP gap
- **Run** → run-status panel moving **Queued → Running (progress bar, elapsed time, current gap) → Completed** over about 4–6 seconds, then a result summary (cost, savings vs baseline, utilization, warnings) and an "Open plan" button
- Creates a new plan in state **Generated**

### 6.7 Plan detail
Header with plan ID, version, and a **state-machine badge**. Lifecycle:
`Draft → Optimizing → Generated → Under Review → Approved → Published → Executing → Completed`
Rejection returns the plan to Draft with the rejection reason recorded. An approved plan is never edited in place; an override creates a new version.

Tabs:
- **Schedule:** Gantt, rows = lines, columns = days. Bars colored by product family, small changeover markers, bottleneck highlighting on Line 3, hover tooltip (product, quantity, start/end). A filter by product, line and date range
- **Production:** table by product and period (quantity, batch count)
- **Materials:** requirements for this plan
- **Capacity:** utilization bars per line and machine with a threshold line
- **Cost:** cost summary for the plan (links to the Cost breakdown screen)
- **Explanations:** the decision reasons for this plan (see 6.9)
- **Versions & timeline:** state history with user, role, timestamp

Actions (gated by role and state): Planner → **Override** (drawer: choose change, **mandatory reason**, shows a recalculated cost/KPI delta), **Submit for approval**. Production Manager → **Approve / Reject** (rejection requires a comment). Every action updates state and appends to the audit log.

### 6.8 Approvals
Queue of plans Under Review (Production Manager acts) and the Planner's submission history. Each row opens the plan with a side-by-side comparison against the baseline.

### 6.9 Scenarios and Explainability (Analysis)
**Scenarios**
- List plus a create dialog: base plan, scenario type, parameter value
- Eight types in the picker: demand change, machine downtime, material price change, supplier delay, labor shortage, energy price change, capacity expansion, overtime policy. **Wire at least four end-to-end** (demand, machine downtime, material price, supplier delay); the rest may reuse a generic result generator
- Running takes about 3 seconds, then a **comparison view** of up to 3 columns: Current plan, Scenario A, Scenario B, over Total Cost, Production, Inventory, Overtime, Service Level, Utilization, Shortage, and Savings = current cost − optimized cost (amount and %). Add a bar chart
- Seed one **infeasible** scenario (e.g. demand +40%) showing the **infeasibility diagnostics** panel: a ranked list of binding constraints and suggested remedies, in business language, such as "Production plan is infeasible because Line 3 lacks 84 machine-hours required to satisfy Product B demand" and "Material M-102 is short by 4,500 units; earliest supplier replenishment is 12 days after the required production date". Suggested remedies: overtime, alternative machine, alternative supplier, outsourcing, demand adjustment, inventory drawdown

**Explainability**
- Reason cards generated from mock constraint data, e.g. "Product A was moved from Line 2 to Line 4 because Line 2 was at 98% capacity while Line 4 had 23% unused capacity" and "Overtime was introduced because its cost was lower than the estimated shortage penalty"
- A **constraint slack table**: constraint, binding yes/no, slack, units, status. Highlight binding constraints
- Every reallocation on the Gantt must have a matching reason card

### 6.10 Cost breakdown
Stacked bar of the ten cost components, baseline vs optimized, a table with deltas, cost per unit, and cost by product family. Admin gets a collapsible **Cost parameters** editor (rates, versioned); others see it read-only.

### 6.11 Reports
Cards for production plan, procurement/material, inventory and cost reports with **PDF** and **Excel** buttons. Clicking shows a short generating state then a toast "Report generated (mock)". Optionally make Excel produce a real `.csv` from mock data client-side. Show a generated-reports history list.

### 6.12 Users & roles (Admin)
User table (name, role, status), invite-user dialog (email + role), change-role and deactivate actions. All fake, all written to the audit log.

### 6.13 Audit trail
Append-only table: timestamp, user, role, action, entity, before → after, reason. Filters by user, action and date. **No edit or delete controls anywhere.** Every state-changing action in the app appends a row immediately.

---

## 7. Chat assistant

The architecture says the chat performs the same tasks as the screens by calling the same endpoints, limited by the user's role. Show that literally.

**Behaviour**
- Floating widget everywhere plus `/chat` full page, sharing one conversation per session
- Intent matching: lowercase the message and match against keyword lists; pick the best intent; otherwise a fallback reply listing what the user can ask
- Reply flow: typing indicator (600–1200 ms) → **tool-call chip** showing the endpoint being "called" → result message with an "Open in <screen>" link button
- The same underlying store actions as the screens run (a chat-triggered run really creates the plan in the store)
- Starter suggestion chips per role
- **Role limits:** if the intent is not permitted, reply with a polite refusal naming the role and the role that can do it. Use `permissions.ts` to decide

**Tool-call chips (display only)**

| Intent | Chip |
|---|---|
| Run forecast | `POST /api/forecasts/runs` |
| Run optimization | `POST /api/optimization/runs` then `GET /api/optimization/runs/{id}` |
| Create and run scenario | `POST /api/scenarios` then `POST /api/scenarios/{id}/run` |
| Submit plan | `POST /api/production-plans/{id}/submit` |
| Approve plan | `POST /api/production-plans/{id}/approve` |
| Override | `POST /api/production-plans/{id}/override` |

**Intents by role**
- **Planner:** run optimization for the next 4 weeks; create a scenario ("demand +15%", "line 3 downtime +20%"); show material shortages; why was a product moved to another line; submit the plan. *Asking to approve → refusal*
- **Production Manager:** show pending approvals; approve or reject a plan (reject asks for a reason); summarize cost and savings; which line is the bottleneck; why was a product moved
- **Inventory:** which materials are below safety stock; status of the last upload; where do I upload
- **Admin:** invite a user; change a user's role; show recent audit entries
- **All roles:** "how do I …" help questions answered from a small static FAQ, with a "Sources" footer listing mock document names (the architecture includes a vector store of the SRS, manual and UI docs; fake it with a hard-coded list)

---

## 8. Visual design

- Clean, restrained, professional. Light theme by default, one accent color, neutral grays. No gradients-heavy or "AI app" styling
- Dense but readable tables; consistent spacing; clear empty, loading and error states
- Status colors used consistently: success (approved/completed), warning (under review, shortages), danger (rejected, infeasible, errors), neutral (draft)
- Gantt colors by product family, with a legend
- Large readable type for projector use: body text no smaller than 14 px
- Basic accessibility: semantic landmarks, focus rings, labels on inputs, sufficient contrast, keyboard-reachable dialogs

---

## 9. Code structure and conventions

```
src/
  auth/permissions.ts        # role × screen × action matrix (single source of truth)
  mock/                      # typed data + selectors.ts
  store/                     # Zustand slices: session, plans, scenarios, inventory, audit, chat, ui
  components/                # shared UI (StatusBadge, KpiCard, DataTable, Gantt, ToolCallChip…)
  features/<area>/           # one folder per screen area
  chat/                      # intents.ts, engine.ts, widget + page
  routes.tsx                 # route table with guards driven by permissions.ts
```

- TypeScript strict, no `any`
- Small components, no component over about 250 lines
- All store actions that change state also write an audit entry through one helper
- Simulated delays live in one `simulate(ms)` helper so they are easy to tune
- No magic numbers or strings repeated across components; put constants in one place
- `npm run build` and `npm run lint` must pass after every phase
- Write a short `README.md` covering how to run, how to reset demo data, and the demo script

---

## 10. Demo path (must work end to end)

This is the acceptance test. Walk it before declaring any phase done.

1. Sign in as **Inventory** → Imports → upload a file → see validation (valid / warnings / errors) → skip invalid rows → commit. Dataset version increments, an alert changes
2. Switch to **Planner** → Plan setup → run optimization → watch Queued → Running → Completed → open the plan and inspect the Gantt
3. In chat, as Planner: "create a scenario with demand +15%" → tool chip → comparison view opens
4. As Planner: "approve the plan" → polite role-based refusal
5. Planner overrides one allocation with a reason, sees the cost delta, then **submits for approval**
6. Switch to **Production Manager** → Approvals → open the plan → compare with baseline → read an explanation card → **Approve**
7. Switch to **Admin** → Audit trail shows every step above, attributed to the correct user and role
8. Open the seeded infeasible scenario and show the diagnostics panel
9. Try a forbidden URL as Inventory (e.g. `/approvals`) → Access Denied page
10. User menu → Reset demo data returns everything to the seeded state

---

## 11. Demo controls (user menu)

A small **Demo controls** panel for the presenter:
- Toggle "Force next run to be infeasible"
- Speed: Normal / Fast (scales all simulated delays)
- Jump to a seeded state (e.g. "Plan waiting for approval")
- Reset demo data

---

## 12. Build phases

1. **Scaffold:** Vite, TypeScript, Tailwind, shadcn, router, lint. Empty app shell, login page, banner
2. **Data and state:** typed mock data, selectors, Zustand store, audit helper, `permissions.ts`
3. **Shell, auth, RBAC:** role cards, sidebar and routes from the matrix, Access Denied page, role switcher, user menu
4. **Planning core:** dashboards, plan setup and run, plan detail with Gantt and state machine, override, submit, approvals
5. **Chat:** widget, full page, intents, tool-call chips, role refusals, FAQ
6. **Analysis:** scenarios and comparison, infeasibility diagnostics, explainability, cost breakdown
7. **Data screens:** imports with validation and commit, inventory and demand with forecast panel, material requirements, master data
8. **Admin and output:** users and roles, audit trail, reports
9. **Polish:** demo controls, empty/loading/error states, README, run the demo path in section 10 and fix gaps

Priority if time is short: phases 1–5 and the Gantt must feel real. Phases 7–8 can be lighter shells (tables with plausible data and working navigation).

---

## 13. Do not

- Add a backend, call external APIs or LLMs, or add real authentication
- Parse uploaded files
- Show real Dawlance data or real model/supplier names
- Present savings or accuracy figures as real results
- Hard-code role checks inside components or duplicate the same number in more than one place
- Leave dead buttons: every visible action should either work against the mock store or show a clear "not available in prototype" tooltip
