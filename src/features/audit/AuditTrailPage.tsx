import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { ROLES, type Role } from '@/auth/permissions'
import {
  Search,
  Lock,
  ArrowRight,
} from 'lucide-react'

export const AuditTrailPage: React.FC = () => {
  const { auditLogs } = useAppStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [selectedAction, setSelectedAction] = useState<string>('all')

  // Extract distinct actions
  const distinctActions = Array.from(new Set(auditLogs.map((l) => l.action)))

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = selectedRole === 'all' || log.role === selectedRole
    const matchesAction = selectedAction === 'all' || log.action === selectedAction

    return matchesSearch && matchesRole && matchesAction
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance & Security</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Immutable Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident, append-only log capturing all planning decisions, role changes, and dataset modifications.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Append-Only Ledger (No Edit / Delete)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by entity, user, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50"
          />
        </div>

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
        >
          <option value="all">All Roles</option>
          {(Object.keys(ROLES) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLES[r].name}
            </option>
          ))}
        </select>

        {/* Action Filter */}
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
        >
          <option value="all">All Actions ({distinctActions.length})</option>
          {distinctActions.map((act) => (
            <option key={act} value={act}>
              {act}
            </option>
          ))}
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 flex justify-between">
          <span>Displaying {filteredLogs.length} Logged Audit Events</span>
          <span className="text-slate-400 font-mono">Real-time reactive store</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">State Transition (Before → After)</th>
                <th className="py-3 px-4">Recorded Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => {
                const roleInfo = ROLES[log.role]
                return (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{log.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.userName}</div>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${roleInfo.badgeColor}`}>
                        {roleInfo.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-900">{log.action}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{log.entity}</td>
                    <td className="py-3 px-4 text-xs font-mono">
                      {log.beforeValue ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 line-through">{log.beforeValue}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-900 font-bold">{log.afterValue}</span>
                        </div>
                      ) : (
                        <span className="text-slate-900 font-bold">{log.afterValue}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate" title={log.reason}>
                      {log.reason || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
