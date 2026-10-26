import React from 'react'
import { ROLES, type Role } from '@/auth/permissions'
import { useAppStore } from '@/store/useAppStore'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  CalendarCheck,
  CheckCircle,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { switchRole } = useAppStore()
  const navigate = useNavigate()

  const handleSelectRole = (role: Role) => {
    switchRole(role)
    navigate('/')
  }

  const roleIcons = {
    admin: Shield,
    planner: CalendarCheck,
    production_manager: CheckCircle,
    inventory: Package,
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-6 text-white relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl w-full z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-mono mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>Industrial Production Planning & Cost Optimization Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            IPPCOP Decision Support System
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Select a designated organizational role to access the platform prototype.
          </p>
        </div>

        {/* 4 Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {(Object.keys(ROLES) as Role[]).map((roleKey) => {
            const role = ROLES[roleKey]
            const Icon = roleIcons[roleKey]

            return (
              <button
                key={roleKey}
                type="button"
                onClick={() => handleSelectRole(roleKey)}
                className="group text-left bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-700/60 group-hover:bg-blue-600/20 border border-slate-600 group-hover:border-blue-500/40 flex items-center justify-center text-blue-400 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-700/80 text-slate-300 group-hover:text-white transition-colors">
                    {role.title}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 mb-1 transition-colors flex items-center justify-between">
                  <span>{role.name}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {role.description}
                </p>
              </button>
            )
          })}
        </div>

        {/* Bottom Note */}
        <div className="text-center text-xs text-slate-500">
          <p>
            Prototype login — no credentials required. Runs entirely on simulated browser mock state.
          </p>
        </div>
      </div>
    </div>
  )
}
