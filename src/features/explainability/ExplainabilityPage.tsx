import React from 'react'
import { EXPLAINABILITY_REASONS, CONSTRAINT_SLACK_DATA } from '@/mock/data'
import { StatusBadge } from '@/components/StatusBadge'
import {
  Sparkles,
  AlertTriangle,
  Layers,
  Clock,
  Zap,
} from 'lucide-react'

export const ExplainabilityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Explainable AI & Solvers</div>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5">MILP Optimization Decision Rationales</h1>
        <p className="text-xs text-slate-500 mt-1">
          Algorithmic justification for batch reallocations, peak-shaving, and overtime trade-offs mapped to Gantt schedule items.
        </p>
      </div>

      {/* Decision Reason Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Decision Reason Cards (Schedule Shift Justifications)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EXPLAINABILITY_REASONS.map((reason) => (
            <div
              key={reason.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {reason.id} • {reason.category.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-2">{reason.title}</h3>
                </div>
                {reason.category === 'reallocation' && <Layers className="w-4 h-4 text-blue-500" />}
                {reason.category === 'overtime' && <Clock className="w-4 h-4 text-amber-500" />}
                {reason.category === 'energy' && <Zap className="w-4 h-4 text-purple-500" />}
                {reason.category === 'shortage' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {reason.explanation}
              </p>

              {/* Economic & Operational Impact */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Business Impact:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {reason.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraint Slack Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Mathematical Constraint Slack Table</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Binding constraints (zero slack) indicate physical bottlenecks where capacity investments yield highest ROI.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Constraint ID</th>
                <th className="py-3 px-4">Constraint Description</th>
                <th className="py-3 px-4">Binding Condition</th>
                <th className="py-3 px-4">Available Slack</th>
                <th className="py-3 px-4">Constraint Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CONSTRAINT_SLACK_DATA.map((row) => (
                <tr
                  key={row.id}
                  className={row.binding ? 'bg-rose-50/40 font-semibold' : 'hover:bg-slate-50'}
                >
                  <td className="py-3 px-4 font-mono text-slate-700">{row.id}</td>
                  <td className="py-3 px-4 text-slate-900">{row.constraint}</td>
                  <td className="py-3 px-4">
                    {row.binding ? (
                      <span className="text-rose-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Yes (Active Bottleneck)
                      </span>
                    ) : (
                      <span className="text-slate-500">No</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">
                    {row.slack} {row.units}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={row.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
