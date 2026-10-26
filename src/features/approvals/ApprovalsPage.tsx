import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge } from '@/components/StatusBadge'
import { formatPKRCompact } from '@/mock/selectors'
import { Link } from 'react-router-dom'
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  Clock,
} from 'lucide-react'

export const ApprovalsPage: React.FC = () => {
  const { currentRole, plans, approvePlan, rejectPlan } = useAppStore()

  const [rejectingPlanId, setRejectingPlanId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const baselinePlan = plans.find((p) => p.isBaseline) || plans[0]
  const reviewPlans = plans.filter((p) => p.status === 'Under Review')
  const completedOrPastPlans = plans.filter((p) => p.status !== 'Under Review')

  const handleApprove = (id: string) => {
    approvePlan(id, 'Approved from the Approvals Decision Queue.')
  }

  const handleConfirmReject = () => {
    if (!rejectingPlanId || !rejectReason.trim()) return
    rejectPlan(rejectingPlanId, rejectReason)
    setRejectingPlanId(null)
    setRejectReason('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Governance & Sign-Off</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Production Plan Approvals Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Production Manager is the sole accountable sign-off authority for dispatching shop-floor schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {reviewPlans.length} Pending Review
          </span>
        </div>
      </div>

      {/* Plans Under Review Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Plans Awaiting Approval</span>
        </h2>

        {reviewPlans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
            No plans currently in the review queue.
          </div>
        ) : (
          reviewPlans.map((plan) => {
            const savingsAmt = Math.max(0, baselinePlan.cost.total - plan.cost.total)
            const savingsPct = ((savingsAmt / baselinePlan.cost.total) * 100).toFixed(1)

            return (
              <div
                key={plan.id}
                className="bg-white border border-amber-200 rounded-2xl p-6 shadow-xs space-y-5"
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-base text-slate-900">{plan.name}</h3>
                      <span className="font-mono text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {plan.id}
                      </span>
                      <StatusBadge status={plan.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted by {plan.createdBy} • 4-Week Horizon starting {plan.horizonStart}
                    </p>
                  </div>

                  {/* Actions gated by role */}
                  {currentRole === 'production_manager' ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectingPlanId(plan.id)}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject with Reason</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(plan.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Plan</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      Requires Production Manager approval
                    </div>
                  )}
                </div>

                {/* Side-by-Side Comparison against Baseline */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Side-by-Side Comparison: Baseline vs Submitted Plan
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-400 text-[11px]">Total Plan Cost</div>
                      <div className="mt-1 flex items-baseline justify-between font-mono font-bold">
                        <span className="text-slate-400 line-through text-[11px]">
                          {formatPKRCompact(baselinePlan.cost.total)}
                        </span>
                        <span className="text-slate-900 text-sm">
                          {formatPKRCompact(plan.cost.total)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-emerald-200">
                      <div className="text-slate-400 text-[11px]">Net Savings</div>
                      <div className="mt-1 font-mono font-bold text-emerald-700 text-sm flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>{savingsPct}% ({formatPKRCompact(savingsAmt)})</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-400 text-[11px]">Overtime Cost</div>
                      <div className="mt-1 flex items-baseline justify-between font-mono font-bold">
                        <span className="text-slate-400 line-through text-[11px]">
                          {formatPKRCompact(baselinePlan.cost.overtime)}
                        </span>
                        <span className="text-emerald-700 text-sm">
                          {formatPKRCompact(plan.cost.overtime)}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-slate-400 text-[11px]">Bottleneck Line 3</div>
                      <div className="mt-1 font-mono font-bold text-slate-800 text-sm flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>96.8% Load</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to={`/plan/${plan.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Inspect Gantt Allocation & Explanations</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Submission & Past History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Historical Decisions & Past Submissions</h2>
        <div className="divide-y divide-slate-100 text-xs">
          {completedOrPastPlans.map((plan) => (
            <div key={plan.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800">{plan.name}</div>
                <div className="text-slate-400 text-[11px] font-mono">
                  {plan.id} • Horizon: {plan.horizonStart} • Cost: {formatPKRCompact(plan.cost.total)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={plan.status} size="sm" />
                <Link
                  to={`/plan/${plan.id}`}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  View Plan →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingPlanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Reject Plan {rejectingPlanId}</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter rejection reason. This will revert the plan to Draft and notify the Lead Planner.
            </p>
            <textarea
              required
              rows={3}
              placeholder="e.g. Excessive overtime on Line 3; please rebalance with Line 4 swing line..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:outline-none mb-4"
            />
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRejectingPlanId(null)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
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
