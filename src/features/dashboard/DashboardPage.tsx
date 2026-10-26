import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { KpiCard } from '@/components/KpiCard'
import { StatusBadge } from '@/components/StatusBadge'
import { PRODUCTION_LINES, PRODUCTS } from '@/mock/data'
import {
  calculatePlanKpis,
  calculateLineUtilization,
  formatPKRCompact,
} from '@/mock/selectors'
import { Link } from 'react-router-dom'
import {
  PlayCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Boxes,
  Database,
  Users,
  ShieldCheck,
  CalendarDays,
  FileCheck,
  CheckSquare,
  Layers,
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { currentRole, currentUser, plans, materials, datasetVersion, auditLogs, datasetVersions } = useAppStore()

  const activePlan = plans.find((p) => p.id === 'P-2026-W45') || plans[0]
  const baselinePlan = plans.find((p) => p.isBaseline) || plans[0]

  const kpis = calculatePlanKpis(
    activePlan,
    baselinePlan,
    PRODUCTION_LINES,
    materials,
    PRODUCTS
  )
  const lineUtils = calculateLineUtilization(activePlan, PRODUCTION_LINES)
  const shortageMaterials = materials.filter((m) => m.stockOnHand <= m.safetyStock)

  // 1. Planner Dashboard View
  if (currentRole === 'planner') {
    return (
      <div className="space-y-6">
        {/* Welcome & Shortcut banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-blue-300 uppercase tracking-wider mb-1">
              Planner Control Center • {currentUser.name}
            </div>
            <h1 className="text-xl font-bold tracking-tight">Active Horizon: 4-Week Production Schedule</h1>
            <p className="text-xs text-blue-200 mt-1 max-w-xl">
              Q4 MILP run converged with 0.38% gap. Line 3 bottleneck requires monitoring while copper tubing replenishment is pending.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/plan-setup"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Run New Optimization</span>
            </Link>
            <Link
              to={`/plan/${activePlan.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-colors"
            >
              <span>Open Gantt</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Plan Cost"
            value={formatPKRCompact(activePlan.cost.total)}
            delta={{
              value: `${kpis.savingsPercent}% (${formatPKRCompact(kpis.savingsVsBaselinePKR)})`,
              isPositive: true,
              label: 'Savings vs baseline',
            }}
            icon={TrendingDown}
          />
          <KpiCard
            title="Demand Fulfillment"
            value={`${kpis.demandFulfillmentPercent}%`}
            subtext="Across all 14 appliance SKUs"
            icon={CheckCircle2}
          />
          <KpiCard
            title="Bottleneck Utilization"
            value={`${kpis.bottleneckUtilizationPercent}%`}
            subtext={kpis.bottleneckLineName}
            highlight
            icon={AlertTriangle}
          />
          <KpiCard
            title="Active Plan State"
            value={activePlan.status}
            subtext={`Plan ID: ${activePlan.id} (v${activePlan.version})`}
            icon={FileCheck}
          />
        </div>

        {/* Main Grid: Schedule Snapshot & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule Snapshot */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                Line Utilization & Shift Allocation
              </h3>
              <Link to={`/plan/${activePlan.id}`} className="text-xs font-medium text-blue-600 hover:underline">
                View Full Gantt →
              </Link>
            </div>
            <div className="space-y-4">
              {lineUtils.map((line) => (
                <div key={line.lineId} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800 flex items-center gap-1.5">
                      {line.lineName}
                      {line.isBottleneck && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          Bottleneck
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-slate-600">
                      {line.utilizationPercent}% ({line.allocatedHours}h / {line.capacityHours}h)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        line.utilizationPercent > 92
                          ? 'bg-rose-500'
                          : line.utilizationPercent > 80
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, line.utilizationPercent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Shortages & Alerts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Supply Alerts
                </h3>
                <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                  {shortageMaterials.length} Shortage
                </span>
              </div>
              <div className="space-y-3">
                {shortageMaterials.map((mat) => (
                  <div key={mat.id} className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 text-xs">
                    <div className="font-semibold text-slate-900">{mat.name}</div>
                    <div className="text-slate-600 mt-1 flex justify-between">
                      <span>Stock on hand:</span>
                      <span className="font-mono font-bold text-rose-700">
                        {mat.stockOnHand} {mat.unit}
                      </span>
                    </div>
                    <div className="text-slate-500 flex justify-between text-[11px] mt-0.5">
                      <span>Safety threshold:</span>
                      <span className="font-mono">{mat.safetyStock} {mat.unit}</span>
                    </div>
                  </div>
                ))}
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="font-semibold text-slate-800">Dataset Version In Sync</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Current active inventory snapshot is {datasetVersion}.
                  </div>
                </div>
              </div>
            </div>
            <Link
              to="/material-requirements"
              className="mt-4 w-full py-2 text-center text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors block"
            >
              Open Material Requirements
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 2. Production Manager Dashboard View
  if (currentRole === 'production_manager') {
    const pendingPlans = plans.filter((p) => p.status === 'Under Review')
    return (
      <div className="space-y-6">
        {/* Prominent Pending Approvals Alert */}
        {pendingPlans.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-amber-950 text-base">
                  Action Required: {pendingPlans.length} Plan Waiting for Approval
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Plan {pendingPlans[0].id} was submitted by Lead Planner Usman Farooq for final sign-off.
                </p>
              </div>
            </div>
            <Link
              to="/approvals"
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              Review & Decide in Approvals Queue →
            </Link>
          </div>
        )}

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Total Plan Cost"
            value={formatPKRCompact(activePlan.cost.total)}
            delta={{
              value: `${kpis.savingsPercent}% (${formatPKRCompact(kpis.savingsVsBaselinePKR)})`,
              isPositive: true,
            }}
            icon={TrendingDown}
          />
          <KpiCard
            title="Cost Savings"
            value={formatPKRCompact(kpis.savingsVsBaselinePKR)}
            subtext="Net reduction vs baseline"
            highlight
            icon={TrendingDown}
          />
          <KpiCard
            title="Line 3 Bottleneck"
            value={`${kpis.bottleneckUtilizationPercent}%`}
            subtext="Heavy stamping constraint"
            icon={AlertTriangle}
          />
          <KpiCard
            title="Demand Fulfillment"
            value={`${kpis.demandFulfillmentPercent}%`}
            subtext="Target service level met"
            icon={CheckCircle2}
          />
          <KpiCard
            title="Overtime Hours"
            value={`${kpis.overtimeHours} hrs`}
            subtext="Scheduled across 4 weeks"
            icon={Clock}
          />
        </div>

        {/* Line Utilization Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Shop Floor Capacity Loading by Production Line</h3>
              <p className="text-xs text-slate-500">Nominal 168 hours/week capacity per line over the 4-week planning horizon</p>
            </div>
            <Link to={`/plan/${activePlan.id}`} className="text-xs font-semibold text-blue-600 hover:underline">
              Inspect Schedule Details →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {lineUtils.map((line) => (
              <div
                key={line.lineId}
                className={`p-4 rounded-xl border ${
                  line.isBottleneck ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="text-xs font-semibold text-slate-700 truncate">{line.lineName}</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">{line.utilizationPercent}%</span>
                  {line.isBottleneck && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                      Bottleneck
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full ${line.isBottleneck ? 'bg-rose-600' : 'bg-blue-600'}`}
                    style={{ width: `${line.utilizationPercent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-2">
                  {line.allocatedHours} allocated hrs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 3. Inventory Dashboard View
  if (currentRole === 'inventory') {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inventory Controller View</div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">Warehouse & Stock Positions</h1>
            <p className="text-xs text-slate-500 mt-1">Active dataset: <span className="font-mono font-bold text-slate-800">{datasetVersion}</span></p>
          </div>
          <Link
            to="/imports"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2"
          >
            <Boxes className="w-4 h-4" />
            <span>Upload New Spreadsheet</span>
          </Link>
        </div>

        {/* Inventory KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <KpiCard
            title="Total Tracked SKUs"
            value={materials.length}
            subtext="Raw materials & components"
            icon={Boxes}
          />
          <KpiCard
            title="Stock-Out Risks"
            value={shortageMaterials.length}
            subtext="Materials below safety stock"
            highlight={shortageMaterials.length > 0}
            icon={AlertTriangle}
          />
          <KpiCard
            title="Days of Inventory (DOI)"
            value="18.4 Days"
            subtext="Weighted average across plant"
            icon={Clock}
          />
          <KpiCard
            title="Committed Datasets"
            value={datasetVersions.length}
            subtext="Audit verified snapshots"
            icon={Database}
          />
        </div>

        {/* Stock positions list */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-900 mb-4">Stock Attention List</h3>
          <div className="divide-y divide-slate-100">
            {materials.slice(0, 6).map((mat) => {
              const isShort = mat.stockOnHand <= mat.safetyStock
              return (
                <div key={mat.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{mat.name}</div>
                    <div className="text-slate-400 text-[11px]">{mat.id} • {mat.category}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-mono font-semibold text-slate-800">{mat.stockOnHand} {mat.unit}</div>
                      <div className="text-[11px] text-slate-400">Safety: {mat.safetyStock} {mat.unit}</div>
                    </div>
                    <StatusBadge status={isShort ? 'Stock-out Risk' : 'Adequate'} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // 4. Admin Dashboard View
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Administration</div>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5">Platform Governance & Audit Status</h1>
        <p className="text-xs text-slate-500 mt-1">Single plant deployment: DPL-2</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard title="Active Users" value="8 Accounts" subtext="Across 4 designated roles" icon={Users} />
        <KpiCard title="Current Dataset" value={datasetVersion} subtext="Plant baseline configuration" icon={Database} />
        <KpiCard title="Logged Audit Events" value={auditLogs.length} subtext="Append-only immutable record" icon={ShieldCheck} />
        <KpiCard title="Production Lines" value={PRODUCTION_LINES.length} subtext="16 configured machines" icon={Layers} />
      </div>

      {/* Recent Audit Logs snippet */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-slate-900">Recent Security & Planning Audit Events</h3>
          <Link to="/audit-trail" className="text-xs font-semibold text-blue-600 hover:underline">
            View Full Audit Trail →
          </Link>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-mono text-slate-400 mr-2">[{log.timestamp.substring(11, 16)}]</span>
                <span className="font-semibold text-slate-800">{log.userName}</span>
                <span className="text-slate-500"> — {log.action} on <strong className="text-slate-700">{log.entity}</strong></span>
              </div>
              <span className="text-slate-400 text-[11px]">{log.afterValue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
