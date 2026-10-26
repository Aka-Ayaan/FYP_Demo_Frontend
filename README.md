# IPPCOP — Industrial Production Planning and Cost Optimization Platform (Frontend Prototype)

> **Presentation-Layer Prototype** for university evaluation. Runs completely client-side in the browser with realistic, typed mock data and simulated solver heuristics. No backend, real AI, or secrets required.

---

## 1. Technology Stack

- **Framework:** React 19 + TypeScript (Strict Mode)
- **Bundler & Tooling:** Vite, Oxlint
- **Styling & UI:** Tailwind CSS v4, Lucide Icons
- **State Management:** Zustand (reactive store slices for session, plans, scenarios, materials, audit logs)
- **Routing & Guards:** React Router with single-source-of-truth permission matrix guards
- **Gantt Visualization:** Custom CSS Grid with micro-interactions, changeover markers, and tooltips

---

## 2. Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript check and production build
npm run build

# Run fast linter
npm run lint
```

The application will be running at `http://localhost:5173`.

---

## 3. Four Operating Roles

| Role | Responsibilities | Authority |
|---|---|---|
| **Admin** | Master data parameters, user directory, cost rates, audit trail | System configuration only. Cannot approve plans |
| **Planner** | Demand forecasting, MILP optimizations, scenarios, overrides | Submits plans for approval |
| **Production Manager** | Reviewing bottlenecks, KPIs, costs, and plan approval | Sole accountable approver |
| **Inventory** | Spreadsheet uploads, validation staging, stock positions | Warehouse monitoring |

Role switching is **instant** via the top-right user menu without needing to re-login.

---

## 4. End-to-End Demo Script (10-Step Walkthrough)

Follow these steps to demonstrate all presentation requirements:

1. **Inventory Spreadsheet Ingestion:**
   - Sign in as **Inventory** (or switch to Inventory in user menu).
   - Navigate to **Imports** (`/imports`).
   - Upload any `.xlsx` or `.csv` file into the drag-and-drop zone.
   - Inspect the staging table: 5 Valid, 1 Warning (missing unit), 1 Error (negative quantity).
   - Check *"Skip invalid rows"* and click **Commit & Apply Dataset**.
   - Note that the dataset version increments to `Dataset v4` and the copper tubing stock alert clears.

2. **MILP Optimization Run:**
   - Switch role to **Planner**.
   - Navigate to **Plan Setup & Run** (`/plan-setup`).
   - Adjust objective penalty weights or keep defaults.
   - Click **Execute MILP Optimization Engine**.
   - Watch the live telemetry move through: *Queued → Formulating constraints → Branch & Cut (MIP Gap) → Completed*.
   - Click **Open Plan & Inspect Gantt** to inspect the 4-week CSS Grid schedule.

3. **Copilot Scenario Generation:**
   - Open the Assistant via the floating button or `/chat`.
   - As Planner, send: `"create a scenario with demand +15%"`.
   - Observe the tool-call chip: `POST /api/scenarios`.
   - Click the link chip to open the **Scenarios Comparison Matrix** (`/scenarios`).

4. **Role Permission Refusal:**
   - In the chat, as Planner, ask: `"approve the plan"`.
   - Observe the polite role refusal: explains that Planners can only submit, and only the Production Manager has approval authority.

5. **Schedule Override & Submission:**
   - In **Plan Detail** (`/plan/P-2026-W45`), click **Manual Override...**.
   - Choose an allocation, pick a product, enter a mandatory reason (e.g., *"Shift twin-tub washer to Line 4 flex line"*), and confirm.
   - Note the recalculated cost delta preview and audit entry.
   - Click **Submit for Approval**. The plan status changes to **Under Review**.

6. **Production Manager Approval:**
   - Switch role to **Production Manager**.
   - Notice the prominent pending approval alert on the Dashboard.
   - Open **Approvals Queue** (`/approvals`).
   - Review the side-by-side comparison against the baseline: 6.0% savings (11.07M PKR).
   - Click **Approve Plan**. The status changes to **Approved**.

7. **Audit Trail Verification:**
   - Switch role to **Admin**.
   - Navigate to **Audit Trail** (`/audit-trail`).
   - Confirm every prior action (import commit, solver run, override, submission, approval) is recorded with timestamp, role, user, and before/after values.

8. **Infeasibility Diagnostics:**
   - Navigate to **Scenarios** (`/scenarios`) and select **Scenario B (+40% Volume Surge)**.
   - Inspect the **Infeasibility Diagnostics Report** showing binding constraints (Line 3 heavy press lack of machine hours, copper tubing shortage) and business-language suggested remedies.

9. **Deny-by-Default Route Guard:**
   - Switch role to **Inventory**.
   - Attempt to navigate directly in the browser address bar to `/approvals` or `/cost-breakdown`.
   - Verify that a clear **Access Denied** page renders explaining the restriction.

10. **Reset Demo Data:**
    - Open the top-right user menu.
    - Click **Reset All Demo Data** to return all plans, datasets, and audit logs to the clean seeded state.

---

## 5. Presenter Demo Controls

Click the user menu and open **Demo Controls...** to:
- **Simulation Speed:** Toggle between Normal (3–5s delays) and Fast (snappy demo mode).
- **Force Infeasible:** Toggle next optimization run to simulate mathematical infeasibility.
- **Quick Jump:** Instantly jump to *"Plan Waiting for Approval"* or *"Infeasible Diagnostics"*.
- **Reset:** Restore initial factory benchmark data.
# FYP_Demo_Frontend
