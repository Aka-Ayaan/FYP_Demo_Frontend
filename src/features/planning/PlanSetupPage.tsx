import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { PLANT_NAME, HORIZON_START_DATE } from '@/mock/data'
import { formatPKRCompact } from '@/mock/selectors'
import { useNavigate } from 'react-router-dom'
import {
  PlayCircle,
  Cpu,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react'

export const PlanSetupPage: React.FC = () => {
  const {
    runOptimization,
    isOptimizing,
    optimizationProgress,
    optimizationStatusText,
    plans,
  } = useAppStore()
  const navigate = useNavigate()

  // Form Parameters
  const [horizonStart, setHorizonStart] = useState(HORIZON_START_DATE)
  const [horizonWeeks, setHorizonWeeks] = useState(4)
  const [baselinePlanId, setBaselinePlanId] = useState('P-2026-BASE')
  const [forecastVersion, setForecastVersion] = useState('LightGBM-v2.1 (Ensemble)')
  const [shortagePenalty, setShortagePenalty] = useState(85)
  const [overtimePenalty, setOvertimePenalty] = useState(60)
  const [inventoryPenalty, setInventoryPenalty] = useState(40)
  const [timeLimitSec, setTimeLimitSec] = useState(30)
  const [mipGapPercent, setMipGapPercent] = useState(0.5)

  const [generatedPlanId, setGeneratedPlanId] = useState<string | null>(null)

  const handleStartRun = async (e: React.FormEvent) => {
    e.preventDefault()
    const newPlan = await runOptimization({ timeLimit: timeLimitSec, gap: mipGapPercent })
    setGeneratedPlanId(newPlan.id)
  }

  const generatedPlan = plans.find((p) => p.id === generatedPlanId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Planning Engine</div>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5">MILP Optimization Run Setup</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure objective weights, solver convergence thresholds, and baseline references to generate a new production plan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Parameters */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <form onSubmit={handleStartRun} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Plant Location</label>
                <input
                  type="text"
                  value={PLANT_NAME}
                  disabled
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-100 text-slate-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Planning Horizon Start</label>
                <input
                  type="date"
                  value={horizonStart}
                  onChange={(e) => setHorizonStart(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Horizon Duration</label>
                <select
                  value={horizonWeeks}
                  onChange={(e) => setHorizonWeeks(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value={4}>4 Weeks (Standard Monthly Cycle)</option>
                  <option value={8}>8 Weeks (Extended Outlook)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Baseline Reference Plan</label>
                <select
                  value={baselinePlanId}
                  onChange={(e) => setBaselinePlanId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium font-mono"
                >
                  <option value="P-2026-BASE">P-2026-BASE (Q4 Baseline Operational Plan)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Forecast Version Feed</label>
                <input
                  type="text"
                  value={forecastVersion}
                  onChange={(e) => setForecastVersion(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
                />
              </div>
            </div>

            {/* Objective Sliders */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Multi-Objective Penalty Weights</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Material Shortage Penalty</span>
                    <span className="font-mono font-bold text-blue-700">{shortagePenalty}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={shortagePenalty}
                    onChange={(e) => setShortagePenalty(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Overtime Cost Penalty</span>
                    <span className="font-mono font-bold text-blue-700">{overtimePenalty}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={overtimePenalty}
                    onChange={(e) => setOvertimePenalty(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">Excess Inventory Holding Penalty</span>
                    <span className="font-mono font-bold text-blue-700">{inventoryPenalty}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={inventoryPenalty}
                    onChange={(e) => setInventoryPenalty(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Solver Controls */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Solver Time Limit</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={timeLimitSec}
                    onChange={(e) => setTimeLimitSec(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                  <span className="text-xs text-slate-500">sec</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">MIP Gap Tolerance</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={0.1}
                    value={mipGapPercent}
                    onChange={(e) => setMipGapPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                  <span className="text-xs text-slate-500">%</span>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isOptimizing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Execute MILP Optimization Engine</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Status Panel: Queued -> Running -> Completed */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Solver Execution Telemetry</span>
              </div>

              {isOptimizing ? (
                <div className="space-y-4 py-4 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                      Optimizing Horizon
                    </span>
                    <span className="font-mono text-blue-600 font-bold">{optimizationProgress}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${optimizationProgress}%` }}
                    />
                  </div>

                  <p className="text-xs font-mono text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {optimizationStatusText}
                  </p>
                </div>
              ) : generatedPlan ? (
                <div className="space-y-4 py-2 animate-in zoom-in-95">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Run Completed Successfully!</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Plan Identifier:</span>
                      <span className="font-mono font-bold text-slate-900">{generatedPlan.id}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Initial State:</span>
                      <span className="font-bold text-blue-600">{generatedPlan.status}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Total Plan Cost:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatPKRCompact(generatedPlan.cost.total)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Savings vs Baseline:</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {generatedPlan.savingsVsBaselinePercent}% ({formatPKRCompact(generatedPlan.savingsVsBaselineAmount || 0)})
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/plan/${generatedPlan.id}`)}
                    className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Open Plan & Inspect Gantt</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span>Configure optimization parameters and click Execute to start solver.</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              Solver utilizes Mixed-Integer Linear Programming with branch-and-cut and changeover penalty heuristics.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
