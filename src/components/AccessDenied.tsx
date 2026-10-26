import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { ROLES } from '@/auth/permissions'
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AccessDeniedProps {
  attemptedScreen?: string
  requiredRole?: string
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ attemptedScreen, requiredRole }) => {
  const { currentRole, switchRole } = useAppStore()
  const roleInfo = ROLES[currentRole]

  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          Your current session role (<strong className="text-slate-900">{roleInfo.name}</strong>) does not have permission to view or interact with this screen
          {attemptedScreen ? ` (${attemptedScreen})` : ''}.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 mb-6 text-left space-y-1">
          <div><strong className="text-slate-700">Governance Policy:</strong> Restricted by permissions matrix.</div>
          <div><strong className="text-slate-700">Active Authority:</strong> {roleInfo.title}</div>
          {requiredRole && <div><strong className="text-slate-700">Required Role:</strong> {requiredRole}</div>}
        </div>

        <div className="flex flex-col gap-2">
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>

          {/* Quick role switch shortcut for prototype demo */}
          {currentRole !== 'admin' && (
            <button
              type="button"
              onClick={() => switchRole('admin')}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Switch to Admin for Demo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
