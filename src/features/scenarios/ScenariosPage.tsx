import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge } from '@/components/StatusBadge'
import { formatPKR, formatPKRCompact } from '@/mock/selectors'
import type { Scenario } from '@/mock/types'
import {
  GitCompare,
  Plus,
  AlertTriangle,
  CheckCircle2,
  X,
  Play,
  BarChart2,
  ShieldAlert,
} from 'lucide-react'

export const ScenariosPage: React.FC = () => {
  const {
    currentRole,
    scenarios,
    activeScenarioId,
    createAndRunScenario,
    plans,
  } = useAppStore()

  const currentPlan = plans.find((p) => p.id === 'P-2026-W45') || plans[0]

  // Create Scenario Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioType, setScenarioType] = useState<Scenario['scenarioType']>('demand change')
  const [parameterValue, setParameterValue] = useState('+15% Seasonal Spike')
  const [isSimulating, setIsSimulating] = useState(false)

  // Comparison selection (up to 2 scenarios compared with Current Plan)
  const [compareScenarioIdA, setCompareScenarioIdA] = useState<string>('SCN-01')
  const [compareScenarioIdB, setCompareScenarioIdB] = useState<string>('SCN-03')

  const scenarioA = scenarios.find((s) => s.id === compareScenarioIdA) || scenarios[0]
  const scenarioB = scenarios.find((s) => s.id === compareScenarioIdB) || scenarios[2]

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scenarioName.trim() || isSimulating) return

    setIsSimulating(true)
    const newScn = await createAndRunScenario(scenarioName, scenarioType, parameterValue)
    setIsSimulating(false)
    setIsCreateOpen(false)
    setCompareScenarioIdA(newScn.id)
    setScenarioName('')
  }

  // Active highlighted scenario
  const highlightedScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarioB

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">What-If Analysis</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Scenario Simulation & Infeasibility Diagnostics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate operational disruptions, demand spikes, and supplier delays without modifying live schedules.
          </p>
        </div>

        {/* Action Button: Planner can create */}
        {currentRole === 'planner' ? (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create & Run Scenario</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            View Only Mode
          </span>
        )}
      </div>

      {/* Infeasibility Diagnostics Panel (Section 6.9) */}
      {highlightedScenario && highlightedScenario.status === 'Infeasible' && highlightedScenario.infeasibilityDiagnostics && (
        <div className="bg-rose-50/70 border border-rose-300 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 text-rose-900 font-bold text-base">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
              <span>Infeasibility Diagnostics Report — {highlightedScenario.name}</span>
            </div>
            <StatusBadge status="Infeasible" />
          </div>

          <p className="text-xs text-rose-800 leading-relaxed max-w-3xl">
            The optimization solver proved that no feasible schedule exists under current capacity bounds. The following ranked binding constraints prevent solver convergence:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Binding Constraints */}
            <div className="bg-white/80 rounded-xl p-4 border border-rose-200 space-y-2">
              <div className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Ranked Binding Constraints</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-800 list-disc pl-4">
                {highlightedScenario.infeasibilityDiagnostics.bindingConstraints.map((c, i) => (
                  <li key={i} className="leading-relaxed">
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Remedies in Business Language */}
            <div className="bg-white/80 rounded-xl p-4 border border-emerald-200 space-y-2">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Suggested Actionable Remedies</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-800">
                {highlightedScenario.infeasibilityDiagnostics.suggestedRemedies.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Scenario Comparison Table & Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-blue-600" />
              Side-by-Side Multi-Scenario Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500">Benchmark current baseline against simulated disruption scenarios</p>
          </div>

          {/* Selectors for comparison columns */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Compare:</span>
            <select
              value={compareScenarioIdA}
              onChange={(e) => setCompareScenarioIdA(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  Col 2: {s.name}
                </option>
              ))}
            </select>

            <select
              value={compareScenarioIdB}
              onChange={(e) => setCompareScenarioIdB(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-medium"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  Col 3: {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                <th className="py-3 px-4 w-1/4">Evaluation KPI</th>
                <th className="py-3 px-4 w-1/4 text-blue-900 font-bold bg-blue-50/50">
                  Current Plan ({currentPlan.id})
                </th>
                <th className="py-3 px-4 w-1/4">
                  Scenario A: {scenarioA?.name}
                </th>
                <th className="py-3 px-4 w-1/4">
                  Scenario B: {scenarioB?.name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-700">Feasibility Status</td>
                <td className="py-2.5 px-4 bg-blue-50/20 font-bold text-emerald-700">Feasible (Optimal)</td>
                <td className="py-2.5 px-4">
                  <StatusBadge status={scenarioA?.status || 'Ready'} size="sm" />
                </td>
                <td className="py-2.5 px-4">
                  <StatusBadge status={scenarioB?.status || 'Ready'} size="sm" />
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-700">Total Operational Cost</td>
                <td className="py-2.5 px-4 bg-blue-50/20 font-mono font-bold text-slate-900">
                  {formatPKR(currentPlan.cost.total)}
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                  {formatPKR(scenarioA?.cost.total || 0)}
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                  {formatPKR(scenarioB?.cost.total || 0)}
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-700">Cost Savings vs Baseline</td>
                <td className="py-2.5 px-4 bg-blue-50/20 font-mono font-bold text-emerald-700">
                  {currentPlan.savingsVsBaselinePercent}% ({formatPKRCompact(currentPlan.savingsVsBaselineAmount || 0)})
                </td>
                <td className="py-2.5 px-4 font-mono text-emerald-700">
                  {scenarioA?.savingsVsBaselinePercent}% ({formatPKRCompact(scenarioA?.savingsVsBaselineAmount || 0)})
                </td>
                <td className="py-2.5 px-4 font-mono text-slate-400">
                  {scenarioB?.savingsVsBaselinePercent ? `${scenarioB.savingsVsBaselinePercent}%` : '0% (Infeasible)'}
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-700">Production Units</td>
                <td className="py-2.5 px-4 bg-blue-50/20 font-mono font-bold">13,200 units</td>
                <td className="py-2.5 px-4 font-mono">{scenarioA?.productionUnits.toLocaleString()} units</td>
                <td className="py-2.5 px-4 font-mono">{scenarioB?.productionUnits.toLocaleString()} units</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-700">Overtime Hours</td>
                <td className="py-2.5 px-4 bg-blue-50/20 font-mono font-bold">96 hrs</td>
                <td className="py-2.5 px-4 font-mono">{scenarioA?.overtimeHours} hrs</td>
                <td className="py-2.5 px-4 font-mono text-rose-700 font-bold">{scenarioB?.overtimeHours} hrs</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-700">Service Level</td>
                <td className="py-2.5 px-4 bg-blue-50/20 font-mono font-bold">98.2%</td>
                <td className="py-2.5 px-4 font-mono">{scenarioA?.serviceLevelPercent}%</td>
                <td className="py-2.5 px-4 font-mono text-rose-700 font-bold">{scenarioB?.serviceLevelPercent}%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-700">Average Utilization</td>
                <td className="py-2.5 px-4 bg-blue-50/20 font-mono font-bold">82.8%</td>
                <td className="py-2.5 px-4 font-mono">{scenarioA?.averageUtilizationPercent}%</td>
                <td className="py-2.5 px-4 font-mono text-rose-700 font-bold">{scenarioB?.averageUtilizationPercent}%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-semibold text-slate-700">Unfulfilled Shortage</td>
                <td className="py-2.5 px-4 bg-blue-50/20 font-mono font-bold text-emerald-700">0 units</td>
                <td className="py-2.5 px-4 font-mono">{scenarioA?.shortageUnits} units</td>
                <td className="py-2.5 px-4 font-mono text-rose-700 font-bold">{scenarioB?.shortageUnits} units</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cost Comparison Bar Chart */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Total Operational Cost Visual Comparison (PKR Millions)</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-blue-900">Current Plan ({currentPlan.id})</span>
                <span className="font-mono font-bold">{formatPKRCompact(currentPlan.cost.total)}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(currentPlan.cost.total / 210000000) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800">Scenario A ({scenarioA?.name})</span>
                <span className="font-mono font-bold">{formatPKRCompact(scenarioA?.cost.total || 0)}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${((scenarioA?.cost.total || 0) / 210000000) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800">Scenario B ({scenarioB?.name})</span>
                <span className="font-mono font-bold">{formatPKRCompact(scenarioB?.cost.total || 0)}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${((scenarioB?.cost.total || 0) / 210000000) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE SCENARIO DIALOG */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900">Create What-If Scenario</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Scenario Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Tubing 10-day delay, Line 3 Unplanned Maintenance"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Disruption Scenario Type</label>
                <select
                  value={scenarioType}
                  onChange={(e) => setScenarioType(e.target.value as Scenario['scenarioType'])}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="demand change">Demand Change (Surge / Dip)</option>
                  <option value="machine downtime">Machine Downtime (Unplanned Stoppage)</option>
                  <option value="material price change">Material Price Change (Raw commodity)</option>
                  <option value="supplier delay">Supplier Delay (Extended Lead Time)</option>
                  <option value="labor shortage">Labor Shortage (Absenteeism)</option>
                  <option value="energy price change">Energy Price Change (Tariff Spike)</option>
                  <option value="capacity expansion">Capacity Expansion (Additional tooling)</option>
                  <option value="overtime policy">Overtime Policy (Weekend Cap)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Parameter Deviation</label>
                <input
                  type="text"
                  value={parameterValue}
                  onChange={(e) => setParameterValue(e.target.value)}
                  placeholder="e.g. +20% demand, 3 days downtime"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                Simulation will execute branch-and-cut solver heuristics and measure delta against current plan.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  {isSimulating ? (
                    <span>Solving Scenario...</span>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Simulate Scenario</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
