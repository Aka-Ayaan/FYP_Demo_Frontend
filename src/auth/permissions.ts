export type Role = 'admin' | 'planner' | 'production_manager' | 'inventory'

export interface RoleInfo {
  id: Role
  name: string
  title: string
  description: string
  avatar: string
  badgeColor: string
}

export const ROLES: Record<Role, RoleInfo> = {
  admin: {
    id: 'admin',
    name: 'Admin',
    title: 'System Administrator',
    description: 'System configuration, master data, cost parameters, and security audit access.',
    avatar: 'AD',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
  },
  planner: {
    id: 'planner',
    name: 'Planner',
    title: 'Lead Production Planner',
    description: 'Reviews demand, runs MILP optimizations, creates scenarios, overrides, and submits plans.',
    avatar: 'PL',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300',
  },
  production_manager: {
    id: 'production_manager',
    name: 'Production Manager',
    title: 'Plant Production Manager',
    description: 'Sole accountable approver. Reviews plans, bottleneck lines, KPIs, and costs.',
    avatar: 'PM',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
  },
  inventory: {
    id: 'inventory',
    name: 'Inventory',
    title: 'Inventory Controller',
    description: 'Manages spreadsheet uploads, staging validations, stock positions, and stock-out alerts.',
    avatar: 'IC',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300',
  },
}

export type ScreenId =
  | 'dashboard'
  | 'imports'
  | 'master_data'
  | 'inventory_demand'
  | 'material_requirements'
  | 'plan_setup'
  | 'plan_detail'
  | 'approvals'
  | 'scenarios'
  | 'explainability'
  | 'cost_breakdown'
  | 'reports'
  | 'users_roles'
  | 'audit_trail'
  | 'chat'

export type AccessLevel = 'hidden' | 'view' | 'act'

export interface ScreenPermission {
  level: AccessLevel
  actNote?: string
}

// Matrix strictly derived from IPPCOP_FRONTEND_SPEC.md Section 3
export const PERMISSION_MATRIX: Record<ScreenId, Record<Role, ScreenPermission>> = {
  dashboard: {
    admin: { level: 'view' },
    planner: { level: 'view' },
    production_manager: { level: 'view' },
    inventory: { level: 'view' },
  },
  imports: {
    admin: { level: 'act', actNote: 'Master data' },
    planner: { level: 'view' },
    production_manager: { level: 'hidden' },
    inventory: { level: 'act', actNote: 'Inventory spreadsheets' },
  },
  master_data: {
    admin: { level: 'act' },
    planner: { level: 'view' },
    production_manager: { level: 'view' },
    inventory: { level: 'hidden' },
  },
  inventory_demand: {
    admin: { level: 'view' },
    planner: { level: 'act', actNote: 'Demand' },
    production_manager: { level: 'view' },
    inventory: { level: 'act', actNote: 'Stock' },
  },
  material_requirements: {
    admin: { level: 'view' },
    planner: { level: 'view' },
    production_manager: { level: 'view' },
    inventory: { level: 'view' },
  },
  plan_setup: {
    admin: { level: 'view' },
    planner: { level: 'act' },
    production_manager: { level: 'view' },
    inventory: { level: 'hidden' },
  },
  plan_detail: {
    admin: { level: 'view' },
    planner: { level: 'act', actNote: 'Override' },
    production_manager: { level: 'view' },
    inventory: { level: 'hidden' },
  },
  approvals: {
    admin: { level: 'hidden' },
    planner: { level: 'act', actNote: 'Submit' },
    production_manager: { level: 'act', actNote: 'Approve / Reject' },
    inventory: { level: 'hidden' },
  },
  scenarios: {
    admin: { level: 'hidden' },
    planner: { level: 'act' },
    production_manager: { level: 'view' },
    inventory: { level: 'hidden' },
  },
  explainability: {
    admin: { level: 'hidden' },
    planner: { level: 'view' },
    production_manager: { level: 'view' },
    inventory: { level: 'hidden' },
  },
  cost_breakdown: {
    admin: { level: 'act', actNote: 'Parameters' },
    planner: { level: 'view' },
    production_manager: { level: 'view' },
    inventory: { level: 'hidden' },
  },
  reports: {
    admin: { level: 'view' },
    planner: { level: 'act' },
    production_manager: { level: 'act' },
    inventory: { level: 'act', actNote: 'Inventory reports' },
  },
  users_roles: {
    admin: { level: 'act' },
    planner: { level: 'hidden' },
    production_manager: { level: 'hidden' },
    inventory: { level: 'hidden' },
  },
  audit_trail: {
    admin: { level: 'view' },
    planner: { level: 'hidden' },
    production_manager: { level: 'view' },
    inventory: { level: 'hidden' },
  },
  chat: {
    admin: { level: 'act' },
    planner: { level: 'act' },
    production_manager: { level: 'act' },
    inventory: { level: 'act' },
  },
}

export type ActionId =
  | 'run_optimization'
  | 'submit_plan'
  | 'approve_plan'
  | 'reject_plan'
  | 'override_plan'
  | 'create_scenario'
  | 'run_forecast'
  | 'commit_import_inventory'
  | 'commit_import_master'
  | 'edit_cost_parameters'
  | 'manage_users'

export interface ActionCheckResult {
  allowed: boolean
  reason?: string
}

export function canAccessScreen(role: Role, screen: ScreenId): boolean {
  const perm = PERMISSION_MATRIX[screen]?.[role]
  return perm ? perm.level !== 'hidden' : false
}

export function getScreenAccessLevel(role: Role, screen: ScreenId): AccessLevel {
  return PERMISSION_MATRIX[screen]?.[role]?.level ?? 'hidden'
}

export function canPerformAction(role: Role, action: ActionId): ActionCheckResult {
  switch (action) {
    case 'run_optimization':
      if (role === 'planner') return { allowed: true }
      return { allowed: false, reason: 'Only Planners can initiate MILP optimization runs.' }

    case 'submit_plan':
      if (role === 'planner') return { allowed: true }
      return { allowed: false, reason: 'Only Planners can submit production plans for approval.' }

    case 'approve_plan':
    case 'reject_plan':
      if (role === 'production_manager') return { allowed: true }
      return { allowed: false, reason: 'Requires Production Manager approval.' }

    case 'override_plan':
      if (role === 'planner') return { allowed: true }
      return { allowed: false, reason: 'Only Planners can apply manual allocation overrides.' }

    case 'create_scenario':
      if (role === 'planner') return { allowed: true }
      return { allowed: false, reason: 'Only Planners can create and simulate what-if scenarios.' }

    case 'run_forecast':
      if (role === 'planner') return { allowed: true }
      return { allowed: false, reason: 'Only Planners can run statistical and ML demand forecasts.' }

    case 'commit_import_inventory':
      if (role === 'inventory') return { allowed: true }
      return { allowed: false, reason: 'Only Inventory controllers can commit spreadsheet updates.' }

    case 'commit_import_master':
    case 'edit_cost_parameters':
    case 'manage_users':
      if (role === 'admin') return { allowed: true }
      return { allowed: false, reason: 'Requires System Administrator privileges.' }

    default:
      return { allowed: false, reason: 'Action not permitted for this role.' }
  }
}

export interface NavGroup {
  groupName: string
  items: {
    screenId: ScreenId
    label: string
    path: string
    icon: string
  }[]
}

export const NAVIGATION_CONFIG: NavGroup[] = [
  {
    groupName: 'Overview',
    items: [
      { screenId: 'dashboard', label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
    ],
  },
  {
    groupName: 'Data',
    items: [
      { screenId: 'imports', label: 'Imports', path: '/imports', icon: 'Upload' },
      { screenId: 'master_data', label: 'Master Data', path: '/master-data', icon: 'Database' },
    ],
  },
  {
    groupName: 'Operations',
    items: [
      { screenId: 'inventory_demand', label: 'Inventory & Demand', path: '/inventory-demand', icon: 'Boxes' },
      { screenId: 'material_requirements', label: 'Material Requirements', path: '/material-requirements', icon: 'Layers' },
    ],
  },
  {
    groupName: 'Planning',
    items: [
      { screenId: 'plan_setup', label: 'Plan Setup & Run', path: '/plan-setup', icon: 'PlayCircle' },
      { screenId: 'plan_detail', label: 'Plan Detail (Gantt)', path: '/plan/P-2026-W45', icon: 'CalendarDays' },
      { screenId: 'approvals', label: 'Approvals', path: '/approvals', icon: 'CheckSquare' },
    ],
  },
  {
    groupName: 'Analysis & Insight',
    items: [
      { screenId: 'scenarios', label: 'Scenarios', path: '/scenarios', icon: 'GitCompare' },
      { screenId: 'explainability', label: 'Explainability', path: '/explainability', icon: 'Sparkles' },
      { screenId: 'cost_breakdown', label: 'Cost Breakdown', path: '/cost-breakdown', icon: 'DollarSign' },
      { screenId: 'reports', label: 'Reports', path: '/reports', icon: 'FileText' },
    ],
  },
  {
    groupName: 'Admin',
    items: [
      { screenId: 'users_roles', label: 'Users & Roles', path: '/users-roles', icon: 'Users' },
      { screenId: 'audit_trail', label: 'Audit Trail', path: '/audit-trail', icon: 'ShieldCheck' },
    ],
  },
]
