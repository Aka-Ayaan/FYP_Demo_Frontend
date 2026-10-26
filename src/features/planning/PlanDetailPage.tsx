import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge } from '@/components/StatusBadge'
import {
  PRODUCTION_LINES,
  PRODUCTS,
  EXPLAINABILITY_REASONS,
  HORIZON_START_DATE,
} from '@/mock/data'
import {
  calculateLineUtilization,
  formatPKR,
} from '@/mock/selectors'
import {
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit2,
  X,
  Check,
  Filter,
} from 'lucide-react'

export const PlanDetailPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>()
  const {
    currentRole,
    plans,
    submitPlanForApproval,
    approvePlan,
    rejectPlan,
    overrideAllocation,
  } = useAppStore()

  const currentPlan = plans.find((p) => p.id === planId) || plans.find((p) => p.id === 'P-2026-W45') || plans[0]

  const [activeTab, setActiveTab] = useState<
    'schedule' | 'production' | 'materials' | 'capacity' | 'cost' | 'explanations' | 'timeline'
  >('schedule')

  // Gantt filters
  const [selectedFamily, setSelectedFamily] = useState<string>('all')
  const [selectedLineId, setSelectedLineId] = useState<string>('all')

  // Override Drawer state
  const [isOverrideOpen, setIsOverrideOpen] = useState(false)
  const [targetAllocId, setTargetAllocId] = useState<string>('')
  const [newSku, setNewSku] = useState<string>('WM-070-SA')
  const [overrideReason, setOverrideReason] = useState<string>('')
  const [overrideSuccess, setOverrideSuccess] = useState(false)

  // Rejection Dialog state
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const lineUtils = calculateLineUtilization(currentPlan, PRODUCTION_LINES)

  // Generate date labels for the 28 columns
  const baseDate = new Date(HORIZON_START_DATE)
  const daysList = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + i)
    return {
      index: i,
      label: `D${i + 1}`,
      weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dateStr: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    }
  })

  // Handle Override
  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetAllocId || !overrideReason.trim()) return

    overrideAllocation(currentPlan.id, targetAllocId, newSku, overrideReason)
    setOverrideSuccess(true)
    setTimeout(() => {
      setIsOverrideOpen(false)
      setOverrideSuccess(false)
      setOverrideReason('')
    }, 1000)
  }

  // Handle Submit
  const handleSubmitPlan = () => {
    submitPlanForApproval(currentPlan.id, 'Formal submission for Production Manager review.')
  }

  // Handle Approve
  const handleApprovePlan = () => {
    approvePlan(currentPlan.id, 'Production schedule signed off for factory execution.')
  }

  // Handle Reject
  const handleRejectPlan = () => {
    if (!rejectReason.trim()) return
    rejectPlan(currentPlan.id, rejectReason)
    setIsRejectDialogOpen(false)
    setRejectReason('')
  }

  // Lifecycle states ordered sequence
  const LIFECYCLE_STAGES = [
    'Draft',
    'Optimizing',
    'Generated',
    'Under Review',
    'Approved',
    'Published',
    'Executing',
    'Completed',
  ]
  const currentStageIndex = LIFECYCLE_STAGES.indexOf(currentPlan.status)

  return (
    <div className="space-y-6">
      {/* 1. Header with ID, Version, State Machine & Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{currentPlan.name}</h1>
              <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                {currentPlan.id} (v{currentPlan.version})
              </span>
              <StatusBadge status={currentPlan.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Created by {currentPlan.createdBy} • 4-Week Horizon starting {currentPlan.horizonStart}
            </p>
          </div>

          {/* Action Buttons (gated by role and state) */}
          <div className="flex items-center gap-2">
            {/* Planner Actions */}
            {currentRole === 'planner' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const firstAlloc = currentPlan.allocations.find((a) => a.lineId === 'LINE-04') || currentPlan.allocations[0]
                    setTargetAllocId(firstAlloc.id)
                    setIsOverrideOpen(true)
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Manual Override...</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitPlan}
                  disabled={currentPlan.status === 'Under Review' || currentPlan.status === 'Approved'}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Approval</span>
                </button>
              </>
            )}

            {/* Production Manager Actions */}
            {currentRole === 'production_manager' && (
              <>
                <button
                  type="button"
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={currentPlan.status === 'Approved'}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject Plan...</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprovePlan}
                  disabled={currentPlan.status === 'Approved'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Approve Plan</span>
                </button>
              </>
            )}

            {/* Read-only feedback for other roles */}
            {currentRole !== 'planner' && currentRole !== 'production_manager' && (
              <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                View Only Mode
              </span>
            )}
          </div>
        </div>

        {/* State Machine Lifecycle Step Indicator */}
        <div className="pt-4 overflow-x-auto">
          <div className="flex items-center min-w-[700px] text-xs">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const isPassed = currentStageIndex >= idx
              const isCurrent = currentPlan.status === stage
              return (
                <React.Fragment key={stage}>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed && !isCurrent ? '✓' : idx + 1}
                    </span>
                    <span className={`font-semibold ${isCurrent ? 'text-blue-700' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {stage}
                    </span>
                  </div>
                  {idx < LIFECYCLE_STAGES.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isPassed ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Rejection Notification Alert if rejected */}
      {currentPlan.rejectionReason && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong>Plan Returned to Draft by Production Manager:</strong>
            <p className="mt-0.5 text-rose-800">{currentPlan.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Tabs Row */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-xs flex flex-wrap gap-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Schedule (Gantt Chart)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('production')}
          className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'production' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Production Batches
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('capacity')}
          className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'capacity' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Line Capacity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cost')}
          className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'cost' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Cost Summary
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('explanations')}
          className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'explanations' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Explainability Reasons ({EXPLAINABILITY_REASONS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'timeline' ? 'bg-blue-50 text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Versions & Timeline ({currentPlan.history.length})
        </button>
      </div>

      {/* TAB 1: GANTT CHART (CSS Grid + Absolutely Positioned Bars) */}
      {activeTab === 'schedule' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          {/* Gantt Filter Bar & Legend */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100 text-xs">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filters:
              </span>
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
              >
                <option value="all">All Product Families</option>
                <option value="Water Dispenser">Water Dispenser</option>
                <option value="Air Conditioner">Air Conditioner</option>
                <option value="Washing Machine">Washing Machine</option>
                <option value="Microwave Oven">Microwave Oven</option>
              </select>

              <select
                value={selectedLineId}
                onChange={(e) => setSelectedLineId(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50"
              >
                <option value="all">All Lines</option>
                {PRODUCTION_LINES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Family Colors Legend */}
            <div className="flex items-center gap-4 font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-sky-600" />
                <span>Water Dispenser</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600" />
                <span>Air Conditioner</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>Washing Machine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-600" />
                <span>Microwave</span>
              </div>
            </div>
          </div>

          {/* GANTT CONTAINER with CSS Grid */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <div className="min-w-[1100px]">
              {/* Header Days Row */}
              <div className="grid grid-cols-[220px_repeat(28,minmax(30px,1fr))] bg-slate-50 border-b border-slate-200 text-center font-mono text-[11px] font-semibold text-slate-600">
                <div className="p-2 text-left font-sans font-bold text-slate-700 pl-4 border-r border-slate-200">
                  Production Line
                </div>
                {daysList.map((d) => (
                  <div
                    key={d.index}
                    className={`p-1.5 border-r border-slate-200 ${d.isWeekend ? 'bg-slate-200/50 text-slate-400' : ''}`}
                    title={d.dateStr}
                  >
                    <div>{d.label}</div>
                    <div className="text-[9px] font-sans font-normal text-slate-400">{d.weekday}</div>
                  </div>
                ))}
              </div>

              {/* Line Rows */}
              <div className="divide-y divide-slate-200">
                {PRODUCTION_LINES.filter((l) => selectedLineId === 'all' || l.id === selectedLineId).map((line) => {
                  const lineAllocations = currentPlan.allocations.filter((a) => a.lineId === line.id)

                  return (
                    <div
                      key={line.id}
                      className={`grid grid-cols-[220px_repeat(28,minmax(30px,1fr))] relative min-h-[58px] ${
                        line.bottleneck ? 'bg-rose-50/20' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      {/* Left Line Label */}
                      <div className="p-3 border-r border-slate-200 flex flex-col justify-center bg-white z-10">
                        <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                          <span>{line.name}</span>
                          {line.bottleneck && (
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1 py-0.2 rounded">
                              97%
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{line.id}</span>
                      </div>

                      {/* Day Grid Cells for background weekend striping */}
                      {daysList.map((d) => (
                        <div
                          key={d.index}
                          className={`border-r border-slate-100 ${d.isWeekend ? 'bg-slate-100/40' : ''}`}
                        />
                      ))}

                      {/* Positioned Gantt Bars */}
                      {lineAllocations.map((alloc) => {
                        const prod = PRODUCTS.find((p) => p.sku === alloc.sku)
                        if (selectedFamily !== 'all' && prod?.category !== selectedFamily) return null

                        // Column start is dayIndex + 2 (1-based index, line label is column 1)
                        const colStart = alloc.dayIndex + 2
                        const colSpan = 1 // 1 day bucket

                        return (
                          <div
                            key={alloc.id}
                            style={{
                              gridColumn: `${colStart} / span ${colSpan}`,
                              backgroundColor: prod?.color || '#3b82f6',
                            }}
                            className="absolute inset-y-1.5 inset-x-0.5 rounded-md p-1 shadow-2xs flex flex-col justify-between text-white text-[10px] cursor-pointer group transition-transform hover:scale-[1.03] hover:z-20"
                          >
                            <div className="font-bold font-mono truncate leading-none">
                              {alloc.sku}
                            </div>
                            <div className="text-[9px] opacity-90 font-mono">
                              {alloc.quantity}u
                            </div>

                            {/* Small changeover marker if applicable */}
                            {alloc.changeover && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white" title="30m Tooling Changeover" />
                            )}

                            {/* Hover Tooltip */}
                            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-[11px] z-30 pointer-events-none">
                              <div className="font-bold text-amber-400">{prod?.name}</div>
                              <div className="font-mono text-[10px] text-slate-300">SKU: {alloc.sku}</div>
                              <div className="mt-1 pt-1 border-t border-slate-700 flex justify-between">
                                <span>Batch Quantity:</span>
                                <span className="font-bold">{alloc.quantity} Units</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Shift Duration:</span>
                                <span>{alloc.shiftHours} Hours</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Date:</span>
                                <span>{alloc.date}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTION BATCHES */}
      {activeTab === 'production' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Allocation ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Line</th>
                <th className="py-3 px-4">Product SKU</th>
                <th className="py-3 px-4">Batch Qty</th>
                <th className="py-3 px-4">Shift Hours</th>
                <th className="py-3 px-4">Changeover</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentPlan.allocations.slice(0, 15).map((a) => {
                const prod = PRODUCTS.find((p) => p.sku === a.sku)
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">{a.id}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">{a.date}</td>
                    <td className="py-2.5 px-4 font-mono">{a.lineId}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{a.sku} ({prod?.name})</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-700">{a.quantity} units</td>
                    <td className="py-2.5 px-4 font-mono">{a.shiftHours} hrs</td>
                    <td className="py-2.5 px-4">
                      {a.changeover ? <span className="text-amber-600 font-bold">Yes (30m)</span> : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CAPACITY UTILIZATION */}
      {activeTab === 'capacity' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900">Line Capacity Utilization with Bottleneck Threshold</h3>
            {lineUtils.map((l) => (
              <div key={l.lineId} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span>{l.lineName}</span>
                  <span className="font-mono font-bold">{l.utilizationPercent}%</span>
                </div>
                <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${l.isBottleneck ? 'bg-rose-600' : 'bg-blue-600'}`}
                    style={{ width: `${l.utilizationPercent}%` }}
                  />
                  {/* 85% normal capacity threshold marker line */}
                  <div className="absolute top-0 bottom-0 left-[85%] w-0.5 bg-slate-800 z-10" title="85% Nominal Capacity Benchmark" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COST SUMMARY */}
      {activeTab === 'cost' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Plan Cost Breakdown vs Baseline</h3>
              <p className="text-xs text-slate-500">10 verified cost components summing exactly to total</p>
            </div>
            <Link to="/cost-breakdown" className="text-xs font-semibold text-blue-600 hover:underline">
              Open Full Cost Breakdown Screen →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(currentPlan.cost).map(([key, val]) => (
              <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="text-slate-500 capitalize">{key} Cost</div>
                <div className="font-mono font-bold text-slate-900 mt-1">{formatPKR(val)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPLAINABILITY REASONS */}
      {activeTab === 'explanations' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Mathematical Decision Rationales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXPLAINABILITY_REASONS.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-2">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>{exp.title}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                    {exp.category}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{exp.explanation}</p>
                <div className="pt-2 border-t border-slate-200 text-emerald-800 font-medium">
                  {exp.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: VERSIONS & TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-4">State Transition Audit Trail</h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {currentPlan.history.map((h, i) => (
              <div key={i} className="relative text-xs">
                <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{h.status}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{h.timestamp}</span>
                </div>
                <div className="text-slate-600 mt-0.5">
                  Action by <strong className="text-slate-800">{h.userName}</strong> ({h.role})
                </div>
                {h.note && <p className="text-slate-500 mt-1 italic">"{h.note}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OVERRIDE DRAWER */}
      {isOverrideOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-[420px] bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-sm text-slate-900">Manual Schedule Override</h3>
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplyOverride} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Select Target Schedule Slot
                  </label>
                  <select
                    value={targetAllocId}
                    onChange={(e) => setTargetAllocId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  >
                    {currentPlan.allocations.slice(0, 8).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} — Line {a.lineId} ({a.date}) Current: {a.sku}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Reallocate to Product SKU
                  </label>
                  <select
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mandatory Override Reason *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide engineering rationale for deviation..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                {/* Recalculated delta preview */}
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1 text-slate-700">
                  <div className="font-bold text-blue-900">Projected Recalculation Delta:</div>
                  <div className="flex justify-between">
                    <span>Setup changeover:</span>
                    <span className="font-mono text-amber-700">+30 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost Delta:</span>
                    <span className="font-mono font-semibold">+18,000 PKR</span>
                  </div>
                </div>

                {overrideSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Override applied and appended to audit log!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Confirm Allocation Override
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REJECT DIALOG */}
      {isRejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Reject Production Plan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Rejection will return plan to Draft state. A recorded reason is mandatory for the planner.
            </p>
            <textarea
              required
              rows={3}
              placeholder="Enter rejection reason (e.g. Line 3 overtime allocation excessive)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:outline-none mb-4"
            />
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPlan}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
