import type { Role } from '@/auth/permissions'
import { ROLES } from '@/auth/permissions'
import { CHAT_INTENTS } from './intents'
import { useAppStore } from '@/store/useAppStore'
import { formatPKR, formatPKRCompact } from '@/mock/selectors'

export interface ProcessedReply {
  text: string
  toolChip?: string
  actionLink?: {
    label: string
    path: string
  }
}

export async function processUserMessage(rawMessage: string, role: Role): Promise<ProcessedReply> {
  const query = rawMessage.toLowerCase().trim()
  const store = useAppStore.getState()

  // Find best intent
  let matchedIntent = CHAT_INTENTS.find((intent) =>
    intent.keywords.some((k) => query.includes(k))
  )

  // Direct specific queries
  if (!matchedIntent) {
    if (query.includes('approve') || query.includes('sign off')) {
      matchedIntent = CHAT_INTENTS.find((i) => i.id === 'approve_plan')
    } else if (query.includes('submit')) {
      matchedIntent = CHAT_INTENTS.find((i) => i.id === 'submit_plan')
    } else if (query.includes('scenario') || query.includes('+15') || query.includes('spike')) {
      matchedIntent = CHAT_INTENTS.find((i) => i.id === 'create_scenario')
    } else if (query.includes('optimize') || query.includes('solver') || query.includes('plan setup')) {
      matchedIntent = CHAT_INTENTS.find((i) => i.id === 'run_optimization')
    }
  }

  // Handle Intent Permission Checks
  if (matchedIntent?.allowedRoles && !matchedIntent.allowedRoles.includes(role)) {
    const allowedRoleNames = matchedIntent.allowedRoles
      .map((r) => ROLES[r]?.name || r)
      .join(' or ')
    const currentRoleName = ROLES[role]?.name || role

    if (matchedIntent.id === 'approve_plan') {
      return {
        text: `Authority Refusal: As a ${currentRoleName}, you do not have permission to approve production plans. According to governance policy, only the Production Manager holds sole approval authority. You can submit the plan for review once your schedule validations are complete.`,
        actionLink: {
          label: 'Open Plan Detail to Review',
          path: '/plan/P-2026-W45',
        },
      }
    }

    if (matchedIntent.id === 'run_optimization' || matchedIntent.id === 'create_scenario') {
      return {
        text: `Access Denied: As a ${currentRoleName}, you cannot initiate solver runs. This planning operation is restricted to the Lead Planner.`,
      }
    }

    return {
      text: `Action not permitted: Your current role is ${currentRoleName}. This action requires ${allowedRoleNames} authority.`,
    }
  }

  // Execute matching allowed intents
  switch (matchedIntent?.id) {
    case 'run_optimization': {
      // Actually trigger optimization in the store!
      const newPlan = await store.runOptimization()
      return {
        toolChip: 'POST /api/optimization/runs then GET /api/optimization/runs/P-2026-W45',
        text: `Optimization completed successfully! Generated plan ${newPlan.id} with a 0.38% MIP gap. Total operational cost is ${formatPKRCompact(newPlan.cost.total)}, delivering 6.0% savings (${formatPKR(newPlan.savingsVsBaselineAmount || 11070000)}) vs baseline.`,
        actionLink: {
          label: `Open Plan ${newPlan.id} (Gantt Schedule)`,
          path: `/plan/${newPlan.id}`,
        },
      }
    }

    case 'create_scenario': {
      const param = query.includes('40') ? '+40% Volume Surge' : '+15% Seasonal Spike'
      const scn = await store.createAndRunScenario(
        `Scenario: ${param}`,
        'demand change',
        param
      )
      return {
        toolChip: 'POST /api/scenarios then POST /api/scenarios/' + scn.id + '/run',
        text: `Scenario ${scn.id} (${scn.name}) evaluated. Total cost projected at ${formatPKRCompact(scn.cost.total)} with ${scn.status === 'Infeasible' ? 'CRITICAL INFEASIBILITY' : '97.5% service level'}.`,
        actionLink: {
          label: 'Open Scenario Comparison',
          path: '/scenarios',
        },
      }
    }

    case 'submit_plan': {
      const activePlan = store.plans.find((p) => p.id === store.activePlanId) || store.plans[0]
      store.submitPlanForApproval(activePlan.id, 'Submitted via Assistant chat request')
      return {
        toolChip: `POST /api/production-plans/${activePlan.id}/submit`,
        text: `Plan ${activePlan.id} has been transitioned from ${activePlan.status} to 'Under Review' and routed to Production Manager Tariq Mehmood for formal sign-off.`,
        actionLink: {
          label: 'View Approvals Status',
          path: '/approvals',
        },
      }
    }

    case 'approve_plan': {
      const activePlan = store.plans.find((p) => p.id === store.activePlanId) || store.plans[0]
      store.approvePlan(activePlan.id, 'Approved via Production Manager Assistant chat command')
      return {
        toolChip: `POST /api/production-plans/${activePlan.id}/approve`,
        text: `Plan ${activePlan.id} has been approved! The schedule is now locked for shop floor dispatch. Recorded in audit trail with timestamp.`,
        actionLink: {
          label: 'Open Approved Plan',
          path: `/plan/${activePlan.id}`,
        },
      }
    }

    case 'reject_plan': {
      const activePlan = store.plans.find((p) => p.id === store.activePlanId) || store.plans[0]
      store.rejectPlan(activePlan.id, 'Returned to Draft for load re-balancing on Line 3')
      return {
        toolChip: `POST /api/production-plans/${activePlan.id}/reject`,
        text: `Plan ${activePlan.id} was rejected and reverted to Draft state. Reason logged: Line 3 load re-balancing required.`,
        actionLink: {
          label: 'Open Plan Details',
          path: `/plan/${activePlan.id}`,
        },
      }
    }

    case 'show_shortages': {
      return {
        text: `Current material stock analysis reveals 1 critical shortage: Seamless Copper Tubing 3/8" (RM-102) has 3,400 meters on hand vs safety threshold of 8,000 meters (Deficit: 4,500m). Supplier B lead time is 14 days. An expedited purchase order is recommended.`,
        actionLink: {
          label: 'Open Material Requirements',
          path: '/material-requirements',
        },
      }
    }

    case 'bottleneck_query': {
      return {
        text: `Plant 1 primary bottleneck is Line 3 (Heavy Press & Washers) operating at 96.8% utilization during peak weeks. The heavy hydraulic stamping press (MC-08) is the binding equipment constraint with under 5 hours of slack per week.`,
        actionLink: {
          label: 'View Line Capacity Breakdown',
          path: '/plan/P-2026-W45',
        },
      }
    }

    case 'cost_summary': {
      return {
        text: `The active Q4 MILP Plan (P-2026-W45) achieves a total cost of 173.43M PKR compared to the baseline of 184.50M PKR, delivering 11.07M PKR (6.0%) in net savings across 10 exact cost components. Overtime expenses were decreased by 3.6M PKR and setup waste reduced by 1.25M PKR.`,
        actionLink: {
          label: 'Open Cost Breakdown Table',
          path: '/cost-breakdown',
        },
      }
    }

    case 'why_moved': {
      return {
        text: `Semi-Automatic Washer (WM-070-SA) was moved from Line 3 to Line 4 because Line 3 heavy stamping was at 97% capacity with high overtime penalties, while Line 4 had 26% available swing capacity. This saved 34 overtime hours without compromising delivery targets.`,
        actionLink: {
          label: 'Open Explainability Details',
          path: '/explainability',
        },
      }
    }

    case 'pending_approvals': {
      return {
        text: `There is currently 1 production plan in the review queue: Plan P-2026-W45 submitted by Lead Planner Usman Farooq, awaiting Production Manager decision.`,
        actionLink: {
          label: 'Open Approvals Queue',
          path: '/approvals',
        },
      }
    }

    case 'upload_status': {
      return {
        text: `Current active dataset version is ${store.datasetVersion}. The last upload contained 22 validated spreadsheet rows. To upload new weekly stock counts, navigate to the Imports screen.`,
        actionLink: {
          label: 'Open Imports Screen',
          path: '/imports',
        },
      }
    }

    case 'recent_audit': {
      const topLogs = store.auditLogs.slice(0, 3)
      const logSummary = topLogs.map((l) => `• [${l.timestamp.substring(11, 16)}] ${l.userName} (${l.role}): ${l.action} on ${l.entity}`).join('\n')
      return {
        text: `Recent audit trail entries:\n${logSummary}`,
        actionLink: {
          label: 'Open Full Audit Trail',
          path: '/audit-trail',
        },
      }
    }

    case 'how_to_help':
    default: {
      return {
        text: `Here is what you can ask me based on your active role:\n• "Run optimization for the next 4 weeks"\n• "Create a scenario with demand +15%"\n• "Which line is the primary bottleneck?"\n• "Why was a product moved to another line?"\n• "Show material shortages and stock risks"\n• "Submit plan P-2026-W45 for approval"\n\nSources: IPPCOP System Requirements Specification (SRS v1.4), DPL-2 Production Operations Manual, MILP Solver Mathematical Formulation Guide.`,
      }
    }
  }
}
