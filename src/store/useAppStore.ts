import { create } from 'zustand'
import type { Role } from '@/auth/permissions'
import {
  PLANT_NAME,
  CURRENT_DATASET_VERSION,
  USERS,
  MATERIALS,
  SEED_PLANS,
  SEED_SCENARIOS,
  SEED_AUDIT_LOG,
  DATASET_VERSIONS,
  OPTIMIZED_COST,
} from '@/mock/data'
import type {
  ProductionPlan,
  Scenario,
  Material,
  AuditLogEntry,
  DatasetVersion,
  UserAccount,
} from '@/mock/types'
import { simulate, setGlobalDemoSpeed } from './simulate'

export interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  role?: Role
  text: string
  timestamp: string
  toolChip?: string
  actionLink?: {
    label: string
    path: string
  }
}

interface AppState {
  // Session
  currentRole: Role
  currentUser: UserAccount
  plantName: string
  datasetVersion: string
  switchRole: (role: Role) => void

  // Data & Master
  materials: Material[]
  datasetVersions: DatasetVersion[]
  commitSpreadsheetImport: (fileName: string, validRows: number) => Promise<void>

  // Plans
  plans: ProductionPlan[]
  activePlanId: string
  isOptimizing: boolean
  optimizationProgress: number // 0-100
  optimizationStatusText: string
  setActivePlanId: (id: string) => void
  runOptimization: (params?: { timeLimit?: number; gap?: number }) => Promise<ProductionPlan>
  submitPlanForApproval: (planId: string, reason?: string) => boolean
  approvePlan: (planId: string, comment?: string) => boolean
  rejectPlan: (planId: string, reason: string) => boolean
  overrideAllocation: (planId: string, allocationId: string, newSku: string, reason: string) => boolean

  // Scenarios
  scenarios: Scenario[]
  activeScenarioId: string | null
  setActiveScenarioId: (id: string | null) => void
  createAndRunScenario: (
    name: string,
    scenarioType: Scenario['scenarioType'],
    parameterValue: string
  ) => Promise<Scenario>

  // Audit Log
  auditLogs: AuditLogEntry[]
  logAction: (action: string, entity: string, afterValue: string, beforeValue?: string, reason?: string) => void

  // Chat
  chatMessages: ChatMessage[]
  isChatOpen: boolean
  setChatOpen: (open: boolean) => void
  toggleChat: () => void
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void

  // Demo Controls
  forceNextRunInfeasible: boolean
  demoSpeed: 'normal' | 'fast'
  setForceNextRunInfeasible: (val: boolean) => void
  setDemoSpeed: (speed: 'normal' | 'fast') => void
  jumpToState: (statePreset: 'waiting_approval' | 'approved' | 'infeasible_scenario') => void
  resetDemoData: () => void
}

const INITIAL_ROLE: Role = 'planner'
const getRoleUser = (role: Role): UserAccount => {
  return USERS.find((u) => u.role === role) || USERS[2]
}

export const useAppStore = create<AppState>((set, get) => ({
  // Session
  currentRole: INITIAL_ROLE,
  currentUser: getRoleUser(INITIAL_ROLE),
  plantName: PLANT_NAME,
  datasetVersion: CURRENT_DATASET_VERSION,

  switchRole: (role: Role) => {
    const user = getRoleUser(role)
    const state = get()
    state.logAction(
      'Switch User Session Role',
      'Session',
      `${user.name} (${role})`,
      `${state.currentUser.name} (${state.currentRole})`,
      'Instant demo role change from user menu'
    )
    set({
      currentRole: role,
      currentUser: user,
    })
  },

  // Inventory & Datasets
  materials: JSON.parse(JSON.stringify(MATERIALS)),
  datasetVersions: JSON.parse(JSON.stringify(DATASET_VERSIONS)),

  commitSpreadsheetImport: async (fileName: string, validRows: number) => {
    await simulate(800)
    const state = get()
    const nextVerNumber = state.datasetVersions.length + 1
    const nextVerString = `Dataset v${nextVerNumber}`

    const newVersion: DatasetVersion = {
      version: nextVerString,
      committedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      committedBy: `${state.currentUser.name} (${state.currentRole})`,
      type: 'Inventory Spreadsheets',
      rowCount: validRows,
      changesDescription: `Spreadsheet import committed from '${fileName}' (${validRows} valid rows staged).`,
    }

    // Visibly update mock data: increase stock for copper tubing RM-102 so the shortage alert clears
    const updatedMaterials = state.materials.map((m) => {
      if (m.id === 'RM-102') {
        return {
          ...m,
          stockOnHand: m.stockOnHand + 6000, // Moves above safety stock!
        }
      }
      return m
    })

    state.logAction(
      'Commit Spreadsheet Import',
      'Inventory Dataset',
      nextVerString,
      state.datasetVersion,
      `Committed staging batch from ${fileName} with ${validRows} rows.`
    )

    set({
      datasetVersion: nextVerString,
      datasetVersions: [newVersion, ...state.datasetVersions],
      materials: updatedMaterials,
    })
  },

  // Plans
  plans: JSON.parse(JSON.stringify(SEED_PLANS)),
  activePlanId: 'P-2026-W45',
  isOptimizing: false,
  optimizationProgress: 0,
  optimizationStatusText: '',

  setActivePlanId: (id: string) => set({ activePlanId: id }),

  runOptimization: async () => {
    const state = get()
    set({ isOptimizing: true, optimizationProgress: 10, optimizationStatusText: 'Queued in solver pool...' })
    await simulate(600)

    set({ optimizationProgress: 35, optimizationStatusText: 'Formulating MILP objective and capacity constraints...' })
    await simulate(800)

    set({ optimizationProgress: 65, optimizationStatusText: 'Branch & Cut exploring integer solutions (MIP Gap 1.8%)...' })
    await simulate(1000)

    set({ optimizationProgress: 90, optimizationStatusText: 'Heuristic search converged (MIP Gap 0.38%)...' })
    await simulate(600)

    const isForceInfeasible = state.forceNextRunInfeasible
    const planSeq = state.plans.length + 1
    const newPlanId = `P-2026-OPT${planSeq}`

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const base = state.plans[0]

    let newPlan: ProductionPlan

    if (isForceInfeasible) {
      newPlan = {
        id: newPlanId,
        version: 1,
        name: `Optimization Run #${planSeq} (Infeasible)`,
        horizonStart: base.horizonStart,
        horizonWeeks: 4,
        status: 'Generated',
        isBaseline: false,
        createdAt: now,
        updatedAt: now,
        createdBy: `${state.currentUser.name} (${state.currentRole})`,
        allocations: JSON.parse(JSON.stringify(base.allocations)),
        cost: {
          ...OPTIMIZED_COST,
          shortage: 32000000,
          total: OPTIMIZED_COST.total + 35000000,
        },
        savingsVsBaselineAmount: 0,
        savingsVsBaselinePercent: 0,
        overridesApplied: 0,
        history: [
          {
            status: 'Generated',
            timestamp: now,
            userId: state.currentUser.id,
            userName: state.currentUser.name,
            role: state.currentRole,
            note: 'Solver completed with binding infeasibility diagnostics.',
          },
        ],
      }
    } else {
      newPlan = {
        id: newPlanId,
        version: 1,
        name: `Optimization Run #${planSeq} (4-Week Optimal)`,
        horizonStart: base.horizonStart,
        horizonWeeks: 4,
        status: 'Generated',
        isBaseline: false,
        createdAt: now,
        updatedAt: now,
        createdBy: `${state.currentUser.name} (${state.currentRole})`,
        allocations: JSON.parse(JSON.stringify(state.plans.find((p) => p.id === 'P-2026-W45')?.allocations || base.allocations)),
        cost: OPTIMIZED_COST,
        savingsVsBaselineAmount: 11070000,
        savingsVsBaselinePercent: 6.0,
        overridesApplied: 0,
        history: [
          {
            status: 'Generated',
            timestamp: now,
            userId: state.currentUser.id,
            userName: state.currentUser.name,
            role: state.currentRole,
            note: 'Generated via Branch & Cut MILP solver with 0.38% gap.',
          },
        ],
      }
    }

    state.logAction(
      'MILP Optimization Solved',
      `Plan ${newPlanId}`,
      newPlan.status,
      'Optimizing',
      isForceInfeasible ? 'Infeasible run simulated with binding constraints' : 'Cost reduced 6.0% below baseline'
    )

    set({
      isOptimizing: false,
      optimizationProgress: 100,
      optimizationStatusText: 'Completed',
      plans: [newPlan, ...state.plans],
      activePlanId: newPlanId,
      forceNextRunInfeasible: false, // Reset flag
    })

    return newPlan
  },

  submitPlanForApproval: (planId: string, reason?: string) => {
    const state = get()
    const targetPlan = state.plans.find((p) => p.id === planId)
    if (!targetPlan) return false

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const updatedPlans = state.plans.map((p) => {
      if (p.id === planId) {
        return {
          ...p,
          status: 'Under Review' as const,
          updatedAt: now,
          history: [
            ...p.history,
            {
              status: 'Under Review' as const,
              timestamp: now,
              userId: state.currentUser.id,
              userName: state.currentUser.name,
              role: state.currentRole,
              note: reason || 'Submitted for Production Manager review and sign-off.',
            },
          ],
        }
      }
      return p
    })

    state.logAction(
      'Submit Plan for Approval',
      `Plan ${planId}`,
      'Under Review',
      targetPlan.status,
      reason || 'Planner submitted schedule to Production Manager'
    )

    set({ plans: updatedPlans })
    return true
  },

  approvePlan: (planId: string, comment?: string) => {
    const state = get()
    const targetPlan = state.plans.find((p) => p.id === planId)
    if (!targetPlan) return false

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const updatedPlans = state.plans.map((p) => {
      if (p.id === planId) {
        return {
          ...p,
          status: 'Approved' as const,
          updatedAt: now,
          history: [
            ...p.history,
            {
              status: 'Approved' as const,
              timestamp: now,
              userId: state.currentUser.id,
              userName: state.currentUser.name,
              role: state.currentRole,
              note: comment || 'Plan approved for plant floor execution.',
            },
          ],
        }
      }
      return p
    })

    state.logAction(
      'Approve Plan',
      `Plan ${planId}`,
      'Approved',
      targetPlan.status,
      comment || 'Sole accountable sign-off by Production Manager'
    )

    set({ plans: updatedPlans })
    return true
  },

  rejectPlan: (planId: string, reason: string) => {
    const state = get()
    const targetPlan = state.plans.find((p) => p.id === planId)
    if (!targetPlan) return false

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const updatedPlans = state.plans.map((p) => {
      if (p.id === planId) {
        return {
          ...p,
          status: 'Draft' as const, // Rejection returns to Draft with rejection reason
          rejectionReason: reason,
          updatedAt: now,
          history: [
            ...p.history,
            {
              status: 'Draft' as const,
              timestamp: now,
              userId: state.currentUser.id,
              userName: state.currentUser.name,
              role: state.currentRole,
              note: `Rejected by Production Manager: ${reason}`,
            },
          ],
        }
      }
      return p
    })

    state.logAction(
      'Reject Plan',
      `Plan ${planId}`,
      'Draft (Rejected)',
      targetPlan.status,
      reason
    )

    set({ plans: updatedPlans })
    return true
  },

  overrideAllocation: (planId: string, allocationId: string, newSku: string, reason: string) => {
    const state = get()
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return false

    let beforeSku = ''
    const updatedAllocations = plan.allocations.map((a) => {
      if (a.id === allocationId) {
        beforeSku = a.sku
        return { ...a, sku: newSku }
      }
      return a
    })

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const updatedPlans = state.plans.map((p) => {
      if (p.id === planId) {
        return {
          ...p,
          allocations: updatedAllocations,
          overridesApplied: p.overridesApplied + 1,
          updatedAt: now,
        }
      }
      return p
    })

    state.logAction(
      'Apply Allocation Override',
      `Allocation ${allocationId}`,
      newSku,
      beforeSku,
      reason
    )

    set({ plans: updatedPlans })
    return true
  },

  // Scenarios
  scenarios: JSON.parse(JSON.stringify(SEED_SCENARIOS)),
  activeScenarioId: 'SCN-01',
  setActiveScenarioId: (id: string | null) => set({ activeScenarioId: id }),

  createAndRunScenario: async (name, scenarioType, parameterValue) => {
    await simulate(1500)
    const state = get()
    const scnId = `SCN-0${state.scenarios.length + 1}`

    const isHighSpike = parameterValue.includes('40') || parameterValue.includes('50')
    const isInfeasible = isHighSpike

    const newScenario: Scenario = {
      id: scnId,
      name,
      basePlanId: state.activePlanId,
      scenarioType,
      parameterValue,
      status: isInfeasible ? 'Infeasible' : 'Ready',
      cost: {
        ...OPTIMIZED_COST,
        overtime: OPTIMIZED_COST.overtime + 1200000,
        energy: OPTIMIZED_COST.energy + 400000,
        total: OPTIMIZED_COST.total + 1600000,
      },
      productionUnits: 13800,
      inventoryCost: 5800000,
      overtimeHours: 120,
      serviceLevelPercent: 97.5,
      averageUtilizationPercent: 86.4,
      shortageUnits: isInfeasible ? 1400 : 0,
      savingsVsBaselineAmount: 9470000,
      savingsVsBaselinePercent: 5.1,
      infeasibilityDiagnostics: isInfeasible
        ? {
            bindingConstraints: [
              'Line 3 heavy stamping press constraint exceeded by 68 hours.',
              'Copper tubing RM-102 stock deficit of 3,200 meters.',
            ],
            suggestedRemedies: [
              'Schedule weekend overtime shifts on Line 3.',
              'Draw down safety buffer from regional warehouse.',
            ],
          }
        : undefined,
    }

    state.logAction(
      'Create What-If Scenario',
      `Scenario ${scnId} (${name})`,
      newScenario.status,
      undefined,
      `Simulated ${scenarioType} with value ${parameterValue}`
    )

    set({
      scenarios: [newScenario, ...state.scenarios],
      activeScenarioId: scnId,
    })

    return newScenario
  },

  // Audit Logs
  auditLogs: JSON.parse(JSON.stringify(SEED_AUDIT_LOG)),
  logAction: (action, entity, afterValue, beforeValue, reason) => {
    const state = get()
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
    const newEntry: AuditLogEntry = {
      id: `AUD-${String(state.auditLogs.length + 1).padStart(2, '0')}`,
      timestamp: now,
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      role: state.currentRole,
      action,
      entity,
      beforeValue,
      afterValue,
      reason,
    }
    set({
      auditLogs: [newEntry, ...state.auditLogs],
    })
  },

  // Chat
  chatMessages: [
    {
      id: 'cmsg-1',
      sender: 'assistant',
      text: 'Hello Usman! I am your IPPCOP Decision Assistant. I can trigger optimizations, run what-if scenarios, check bottleneck lines, and explain schedule decisions according to your role.',
      timestamp: '11:20 AM',
    },
  ],
  isChatOpen: false,
  setChatOpen: (open: boolean) => set({ isChatOpen: open }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  addChatMessage: (msg) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newMsg: ChatMessage = {
      ...msg,
      id: `cmsg-${Date.now()}`,
      timestamp: now,
    }
    set((state) => ({
      chatMessages: [...state.chatMessages, newMsg],
    }))
  },

  // Demo Controls
  forceNextRunInfeasible: false,
  demoSpeed: 'normal',
  setForceNextRunInfeasible: (val) => set({ forceNextRunInfeasible: val }),
  setDemoSpeed: (speed) => {
    setGlobalDemoSpeed(speed)
    set({ demoSpeed: speed })
  },

  jumpToState: (statePreset) => {
    const state = get()
    if (statePreset === 'waiting_approval') {
      state.switchRole('production_manager')
      state.setActivePlanId('P-2026-W45')
    } else if (statePreset === 'approved') {
      state.approvePlan('P-2026-W45', 'Jumped to approved state from demo controls')
      state.switchRole('production_manager')
    } else if (statePreset === 'infeasible_scenario') {
      state.setActiveScenarioId('SCN-03')
      state.switchRole('planner')
    }
  },

  resetDemoData: () => {
    setGlobalDemoSpeed('normal')
    set({
      currentRole: INITIAL_ROLE,
      currentUser: getRoleUser(INITIAL_ROLE),
      datasetVersion: CURRENT_DATASET_VERSION,
      materials: JSON.parse(JSON.stringify(MATERIALS)),
      datasetVersions: JSON.parse(JSON.stringify(DATASET_VERSIONS)),
      plans: JSON.parse(JSON.stringify(SEED_PLANS)),
      activePlanId: 'P-2026-W45',
      scenarios: JSON.parse(JSON.stringify(SEED_SCENARIOS)),
      activeScenarioId: 'SCN-01',
      auditLogs: JSON.parse(JSON.stringify(SEED_AUDIT_LOG)),
      forceNextRunInfeasible: false,
      demoSpeed: 'normal',
    })
  },
}))
