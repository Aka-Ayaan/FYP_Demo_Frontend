import type { Role } from '@/auth/permissions'

export interface IntentDefinition {
  id: string
  name: string
  keywords: string[]
  toolChip?: string
  requiredRole?: Role
  forbiddenRoles?: Role[]
  allowedRoles?: Role[]
}

export const CHAT_INTENTS: IntentDefinition[] = [
  {
    id: 'run_optimization',
    name: 'Run Optimization',
    keywords: ['run optimization', 'optimize plan', 'solve schedule', 're-optimize', 'milp run', 'run solver'],
    toolChip: 'POST /api/optimization/runs',
    allowedRoles: ['planner'],
  },
  {
    id: 'create_scenario',
    name: 'Create Scenario',
    keywords: ['create a scenario', 'create scenario', 'demand +15%', 'demand +40%', 'line 3 downtime', 'what-if scenario', 'simulate scenario'],
    toolChip: 'POST /api/scenarios',
    allowedRoles: ['planner'],
  },
  {
    id: 'submit_plan',
    name: 'Submit Plan',
    keywords: ['submit plan', 'submit for approval', 'send to production manager', 'submit schedule'],
    toolChip: 'POST /api/production-plans/P-2026-W45/submit',
    allowedRoles: ['planner'],
  },
  {
    id: 'approve_plan',
    name: 'Approve Plan',
    keywords: ['approve plan', 'approve the plan', 'sign off plan', 'approve schedule'],
    toolChip: 'POST /api/production-plans/P-2026-W45/approve',
    allowedRoles: ['production_manager'],
  },
  {
    id: 'reject_plan',
    name: 'Reject Plan',
    keywords: ['reject plan', 'reject the plan', 'send back plan'],
    toolChip: 'POST /api/production-plans/P-2026-W45/reject',
    allowedRoles: ['production_manager'],
  },
  {
    id: 'show_shortages',
    name: 'Show Material Shortages',
    keywords: ['shortage', 'material shortage', 'below safety stock', 'stock-out', 'deficit', 'copper tubing'],
  },
  {
    id: 'bottleneck_query',
    name: 'Identify Bottleneck',
    keywords: ['bottleneck', 'which line is the bottleneck', 'line utilization', 'capacity constraint'],
  },
  {
    id: 'cost_summary',
    name: 'Cost & Savings Summary',
    keywords: ['cost summary', 'summarize cost', 'savings', 'baseline vs optimized', 'total cost'],
  },
  {
    id: 'why_moved',
    name: 'Explain Reallocation',
    keywords: ['why was a product moved', 'why was wm-070-sa moved', 'why reallocate', 'explain decision', 'reallocation reason'],
  },
  {
    id: 'pending_approvals',
    name: 'Show Pending Approvals',
    keywords: ['pending approvals', 'plans waiting', 'review queue', 'approvals list'],
    allowedRoles: ['production_manager', 'planner'],
  },
  {
    id: 'upload_status',
    name: 'Upload Status',
    keywords: ['upload status', 'last upload', 'where do i upload', 'spreadsheet status', 'import status'],
    allowedRoles: ['inventory', 'admin'],
  },
  {
    id: 'recent_audit',
    name: 'Recent Audit Entries',
    keywords: ['audit log', 'recent audit', 'who changed', 'audit trail', 'recent changes'],
    allowedRoles: ['admin', 'production_manager'],
  },
  {
    id: 'how_to_help',
    name: 'How-to Help',
    keywords: ['how do i', 'how to', 'help', 'guide', 'instructions', 'faq'],
  },
]

export const STARTER_SUGGESTIONS: Record<Role, string[]> = {
  planner: [
    'Run optimization for the next 4 weeks',
    'Create a scenario with demand +15%',
    'Show material shortages and stock-out risks',
    'Why was WM-070-SA moved to Line 4?',
    'Submit the plan for approval',
    'Approve the plan', // To demonstrate polite role refusal!
  ],
  production_manager: [
    'Show pending approvals queue',
    'Summarize cost and savings vs baseline',
    'Which line is the primary bottleneck?',
    'Why was a product moved to another line?',
    'Approve the plan P-2026-W45',
  ],
  inventory: [
    'Which materials are below safety stock?',
    'Status of the last upload and dataset version',
    'Where do I upload new inventory spreadsheets?',
  ],
  admin: [
    'Show recent audit entries across all roles',
    'How do I invite a new user or modify permissions?',
    'Show current dataset version and master parameters',
  ],
}
