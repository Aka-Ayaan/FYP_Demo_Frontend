import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { BASELINE_COST, OPTIMIZED_COST } from '@/mock/data'
import { formatPKR, formatPKRCompact } from '@/mock/selectors'
import {
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Sliders,
} from 'lucide-react'

export const CostBreakdownPage: React.FC = () => {
  const { currentRole, logAction } = useAppStore()

  const [isAdminParamsOpen, setIsAdminParamsOpen] = useState(false)
  const [electricityRate, setElectricityRate] = useState(38.2)
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5)
  const [shortageCostPerUnit, setShortageCostPerUnit] = useState(4500)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault()
    logAction(
      'Update Cost Optimization Parameters',
      'Cost Coefficients',
      `Electricity: ${electricityRate} PKR, Overtime: ${overtimeMultiplier}x, Shortage: ${shortageCostPerUnit} PKR`,
      'Previous Parameters',
      'Calibrated baseline accounting weights'
    )
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  // 10 cost components keys
  const costComponents: Array<{ key: keyof typeof BASELINE_COST; label: string; color: string }> = [
    { key: 'material', label: 'Material & Parts', color: 'bg-blue-600' },
    { key: 'labor', label: 'Direct Labor', color: 'bg-emerald-600' },
    { key: 'machine', label: 'Machine Depreciation', color: 'bg-indigo-600' },
    { key: 'energy', label: 'Industrial Energy', color: 'bg-purple-600' },
    { key: 'setup', label: 'Changeover & Setup', color: 'bg-amber-500' },
    { key: 'inventory', label: 'Inventory Holding', color: 'bg-sky-500' },
    { key: 'overtime', label: 'Overtime Shifts', color: 'bg-rose-500' },
    { key: 'shortage', label: 'Shortage Penalties', color: 'bg-red-700' },
    { key: 'procurement', label: 'Expedited Freight', color: 'bg-teal-600' },
    { key: 'outsourcing', label: 'External Outsourcing', color: 'bg-orange-600' },
  ]

  const totalBaseline = BASELINE_COST.total
  const totalOptimized = OPTIMIZED_COST.total
  const totalSavings = totalBaseline - totalOptimized
  const savingsPct = ((totalSavings / totalBaseline) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financial Engineering</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">10-Component Cost Breakdown & Variance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Exact mathematical summation across all ten direct and indirect industrial cost categories.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Net Plan Cost Savings</div>
          <div className="text-xl font-mono font-bold text-emerald-700 flex items-center justify-end gap-1">
            <TrendingDown className="w-5 h-5" />
            <span>{savingsPct}% ({formatPKRCompact(totalSavings)})</span>
          </div>
        </div>
      </div>

      {/* Visual Stacked Bars: Baseline vs Optimized */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span>Proportional Stacked Cost Comparison</span>
        </h3>

        {/* Baseline Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-700">Baseline Plan (P-2026-BASE)</span>
            <span className="font-mono font-bold text-slate-900">{formatPKR(totalBaseline)}</span>
          </div>
          <div className="w-full h-6 bg-slate-100 rounded-lg overflow-hidden flex">
            {costComponents.map(({ key, color, label }) => {
              const pct = (BASELINE_COST[key] / totalBaseline) * 100
              return (
                <div
                  key={key}
                  className={`${color} hover:opacity-90 transition-opacity relative group`}
                  style={{ width: `${pct}%` }}
                >
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-900 text-white p-2 rounded-lg text-[10px] z-30 pointer-events-none">
                    <div className="font-bold">{label}</div>
                    <div className="font-mono">{formatPKR(BASELINE_COST[key])} ({pct.toFixed(1)}%)</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Optimized Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-blue-900">Optimized Schedule (P-2026-W45)</span>
            <span className="font-mono font-bold text-blue-900">{formatPKR(totalOptimized)}</span>
          </div>
          <div className="w-full h-6 bg-slate-100 rounded-lg overflow-hidden flex">
            {costComponents.map(({ key, color, label }) => {
              const pct = (OPTIMIZED_COST[key] / totalBaseline) * 100 // Normalized to baseline width
              return (
                <div
                  key={key}
                  className={`${color} hover:opacity-90 transition-opacity relative group`}
                  style={{ width: `${pct}%` }}
                >
                  <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-slate-900 text-white p-2 rounded-lg text-[10px] z-30 pointer-events-none">
                    <div className="font-bold">{label}</div>
                    <div className="font-mono">{formatPKR(OPTIMIZED_COST[key])}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 border-t border-slate-100 text-xs">
          {costComponents.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-xs ${color}`} />
              <span className="text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 10-Component Variance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">10-Component Cost Variance & Unit Allocation Table</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">Cost Category</th>
              <th className="py-3 px-4">Baseline Plan (PKR)</th>
              <th className="py-3 px-4">Optimized Plan (PKR)</th>
              <th className="py-3 px-4">Net Variance</th>
              <th className="py-3 px-4">Avg Cost / Unit (13,200u)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {costComponents.map(({ key, label }) => {
              const baseVal = BASELINE_COST[key]
              const optVal = OPTIMIZED_COST[key]
              const delta = optVal - baseVal
              const costPerUnit = Math.round(optVal / 13200)

              return (
                <tr key={key} className="hover:bg-slate-50 font-medium">
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{label}</td>
                  <td className="py-2.5 px-4 text-slate-600">{formatPKR(baseVal)}</td>
                  <td className="py-2.5 px-4 text-slate-900 font-bold">{formatPKR(optVal)}</td>
                  <td className="py-2.5 px-4">
                    {delta < 0 ? (
                      <span className="text-emerald-700 font-bold">
                        -{formatPKR(Math.abs(delta))} ({((delta / baseVal) * 100).toFixed(1)}%)
                      </span>
                    ) : delta > 0 ? (
                      <span className="text-amber-700">
                        +{formatPKR(delta)} (+{((delta / baseVal) * 100).toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="text-slate-400">0 PKR</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{costPerUnit.toLocaleString()} PKR / unit</td>
                </tr>
              )
            })}
            {/* Total Row */}
            <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <td className="py-3 px-4 font-sans">TOTAL INDUSTRIAL COST</td>
              <td className="py-3 px-4">{formatPKR(totalBaseline)}</td>
              <td className="py-3 px-4 text-blue-900">{formatPKR(totalOptimized)}</td>
              <td className="py-3 px-4 text-emerald-700">
                -{formatPKR(totalSavings)} (-{savingsPct}%)
              </td>
              <td className="py-3 px-4 text-blue-900">
                {Math.round(totalOptimized / 13200).toLocaleString()} PKR / unit
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Admin Collapsible Cost Parameters Editor (Section 6.10) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div
          onClick={() => setIsAdminParamsOpen(!isAdminParamsOpen)}
          className="flex items-center justify-between cursor-pointer"
        >
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Cost Parameters & Accounting Coefficients Editor</span>
              {currentRole === 'admin' ? (
                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  Admin Editable
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Read-Only for {currentRole}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit rates used in MILP objective function weighting. Updates append to system audit logs.
            </p>
          </div>
          <button type="button" className="p-1 text-slate-400">
            {isAdminParamsOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isAdminParamsOpen && (
          <form onSubmit={handleSaveParams} className="mt-5 pt-4 border-t border-slate-100 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Peak Electricity Rate (PKR / kWh)
                </label>
                <input
                  type="number"
                  step={0.1}
                  disabled={currentRole !== 'admin'}
                  value={electricityRate}
                  onChange={(e) => setElectricityRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Overtime Pay Multiplier
                </label>
                <input
                  type="number"
                  step={0.1}
                  disabled={currentRole !== 'admin'}
                  value={overtimeMultiplier}
                  onChange={(e) => setOvertimeMultiplier(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Shortage Penalty (PKR / unit)
                </label>
                <input
                  type="number"
                  disabled={currentRole !== 'admin'}
                  value={shortageCostPerUnit}
                  onChange={(e) => setShortageCostPerUnit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono disabled:opacity-60"
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Cost parameters saved and written to audit log!</span>
              </div>
            )}

            {currentRole === 'admin' && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl"
                >
                  Save Parameter Version
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
