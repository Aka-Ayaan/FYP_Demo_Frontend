import React, { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import {
  ROLES,
  NAVIGATION_CONFIG,
  canAccessScreen,
  type Role,
} from '@/auth/permissions'
import { ChatWidget } from '@/chat/ChatWidget'
import { DemoControlsModal } from './DemoControlsModal'
import {
  LayoutDashboard,
  Upload,
  Database,
  Boxes,
  Layers,
  PlayCircle,
  CalendarDays,
  CheckSquare,
  GitCompare,
  Sparkles,
  DollarSign,
  FileText,
  Users,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Sliders,
  LogOut,
  Building2,
  DatabaseZap,
} from 'lucide-react'

// Icon resolver
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Upload,
  Database,
  Boxes,
  Layers,
  PlayCircle,
  CalendarDays,
  CheckSquare,
  GitCompare,
  Sparkles,
  DollarSign,
  FileText,
  Users,
  ShieldCheck,
}

export const AppShell: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    currentRole,
    currentUser,
    plantName,
    datasetVersion,
    switchRole,
    resetDemoData,
  } = useAppStore()

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isDemoControlsOpen, setIsDemoControlsOpen] = useState(false)

  const roleInfo = ROLES[currentRole]

  // Breadcrumb calculation from route path
  const pathSegments = location.pathname.split('/').filter(Boolean)
  const currentPageTitle =
    pathSegments.length === 0
      ? 'Dashboard'
      : pathSegments[0]
          .replace('-', ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      {/* 1. Persistent Banner */}
      <div className="bg-slate-900 text-amber-300 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2 border-b border-slate-800 z-30 shrink-0">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
        <span>Prototype — mock data. Not a reflection of the final product.</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 2. Left Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          {/* Logo & Brand */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              IP
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 leading-none">
                IPPCOP
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Planning Platform
              </div>
            </div>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
            {NAVIGATION_CONFIG.map((group) => {
              // Filter items accessible by the current role
              const accessibleItems = group.items.filter((item) =>
                canAccessScreen(currentRole, item.screenId)
              )

              if (accessibleItems.length === 0) return null

              return (
                <div key={group.groupName} className="space-y-1">
                  <div className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {group.groupName}
                  </div>
                  {accessibleItems.map((item) => {
                    const Icon = ICON_MAP[item.icon] || LayoutDashboard
                    return (
                      <NavLink
                        key={item.screenId}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )
            })}
          </nav>

          {/* Sidebar Footer Plant Info */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{plantName}</span>
            </div>
          </div>
        </aside>

        {/* 3. Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-20">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">IPPCOP</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">{currentPageTitle}</span>
            </div>

            {/* Right Badges & User Menu */}
            <div className="flex items-center gap-3">
              {/* Dataset Version Badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono font-medium text-slate-700">
                <DatabaseZap className="w-3.5 h-3.5 text-blue-600" />
                <span>{datasetVersion}</span>
              </div>

              {/* Role Badge */}
              <div
                className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${roleInfo.badgeColor}`}
              >
                {roleInfo.name}
              </div>

              {/* User Menu Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                    {roleInfo.avatar}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <div className="font-semibold text-slate-800 leading-none">
                      {currentUser.name}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="text-xs font-semibold text-slate-900">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{roleInfo.title}</div>
                    </div>

                    {/* Switch Role Submenu */}
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Active Role
                    </div>
                    {(Object.keys(ROLES) as Role[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          switchRole(r)
                          setIsUserMenuOpen(false)
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          currentRole === r
                            ? 'font-bold text-blue-600 bg-blue-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        <span>{ROLES[r].name}</span>
                        {currentRole === r && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </button>
                    ))}

                    <div className="border-t border-slate-100 my-1.5" />

                    {/* Presenter Demo Controls */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        setIsDemoControlsOpen(true)
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Sliders className="w-3.5 h-3.5 text-blue-600" />
                      <span>Demo Controls...</span>
                    </button>

                    {/* Reset Demo Data */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        resetDemoData()
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                      <span>Reset Demo Data</span>
                    </button>

                    <div className="border-t border-slate-100 my-1.5" />

                    {/* Sign out */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        navigate('/login')
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Scrollable View Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Floating Chat Assistant */}
      <ChatWidget />

      {/* Presenter Demo Controls Dialog */}
      <DemoControlsModal
        isOpen={isDemoControlsOpen}
        onClose={() => setIsDemoControlsOpen(false)}
      />
    </div>
  )
}
