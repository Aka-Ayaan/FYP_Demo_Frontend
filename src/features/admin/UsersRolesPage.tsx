import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { USERS } from '@/mock/data'
import { ROLES, type Role } from '@/auth/permissions'
import { StatusBadge } from '@/components/StatusBadge'
import type { UserAccount } from '@/mock/types'
import {
  UserPlus,
  X,
  CheckCircle2,
} from 'lucide-react'

export const UsersRolesPage: React.FC = () => {
  const { logAction } = useAppStore()

  const [usersList, setUsersList] = useState<UserAccount[]>(JSON.parse(JSON.stringify(USERS)))
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<Role>('planner')
  const [newName, setNewName] = useState('')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim() || !newName.trim()) return

    const newUser: UserAccount = {
      id: `usr-${usersList.length + 1}`,
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'Active',
      lastLogin: 'Never (Invited)',
    }

    setUsersList((prev) => [newUser, ...prev])
    setIsInviteOpen(false)
    setNewEmail('')
    setNewName('')

    logAction(
      'Invite User',
      `User ${newUser.email}`,
      `Role: ${newUser.role}`,
      undefined,
      'Administrator invitation dispatch'
    )

    setToastMsg(`User ${newUser.name} invited successfully!`)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleChangeRole = (userId: string, newRole: Role) => {
    const user = usersList.find((u) => u.id === userId)
    if (!user) return

    const prevRole = user.role
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )

    logAction(
      'Modify User Role',
      `User ${user.name} (${user.id})`,
      newRole,
      prevRole,
      'Administrator RBAC reconfiguration'
    )
  }

  const handleToggleDeactivate = (userId: string) => {
    const user = usersList.find((u) => u.id === userId)
    if (!user) return

    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    )

    logAction(
      nextStatus === 'Inactive' ? 'Deactivate User Account' : 'Reactivate User Account',
      `User ${user.name}`,
      nextStatus,
      user.status,
      'Administrator access control action'
    )
  }

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-18 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Access Governance</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">User Directory & Role Assignments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage factory user profiles, assign operational roles, and enforce security policies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">User Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Operational Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {usersList.map((user) => {
              const roleInfo = ROLES[user.role]
              return (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{user.name}</div>
                    <div className="text-slate-400 font-mono text-[10px]">{user.id}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value as Role)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${roleInfo.badgeColor} focus:outline-none`}
                    >
                      {(Object.keys(ROLES) as Role[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLES[r].name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={user.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{user.lastLogin}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleToggleDeactivate(user.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        user.status === 'Active'
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900">Invite New User Account</h3>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asad Rehman"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. asad.r@dawlance.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Operational Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  {(Object.keys(ROLES) as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {ROLES[r].name} ({ROLES[r].title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                Invitation event will be logged in the immutable system audit trail.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
