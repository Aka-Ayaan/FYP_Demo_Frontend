import type { Role } from '@/auth/permissions'

export type ProductCategory = 'Water Dispenser' | 'Air Conditioner' | 'Washing Machine' | 'Microwave Oven'

export interface Product {
  sku: string
  name: string
  category: ProductCategory
  unitPricePKR: number
  targetWeeklyDemand: number
  color: string
}

export interface ProductionLine {
  id: string
  name: string
  description: string
  bottleneck: boolean
  nominalCapacityHoursPerWeek: number
  machines: string[]
}

export interface Machine {
  id: string
  name: string
  lineId: string
  workCenter: string
  stage: 'sheet-metal forming' | 'foaming' | 'assembly' | 'QC'
  status: 'Operational' | 'Maintenance' | 'Reduced'
  efficiency: number // e.g. 0.95
}

export type MaterialCategory =
  | 'Metals & Sheets'
  | 'Chemicals & Insulation'
  | 'Electrical & Electronics'
  | 'Plastics & Moulding'
  | 'Packaging & Fasteners'

export interface Material {
  id: string
  name: string
  category: MaterialCategory
  unit: string
  unitCostPKR: number
  stockOnHand: number
  safetyStock: number
  reservedStock: number
  substituteMaterialId?: string
}

export interface Supplier {
  id: string
  name: string
  rating: number
  materials: {
    materialId: string
    unitCostPKR: number
    moq: number
    leadTimeDays: number
    monthlyCapacity: number
  }[]
}

export interface BomItem {
  materialId: string
  quantityPerUnit: number
  scrapPercentage: number
  level: number
  isSubstitute?: boolean
}

export interface ProductBom {
  sku: string
  version: string
  items: BomItem[]
}

export interface RoutingStage {
  stage: 'sheet-metal forming' | 'foaming' | 'assembly' | 'QC'
  workCenter: string
  processingMinutesPerUnit: number
  setupMinutes: number
  requiredSkill: string
}

export interface ProductRouting {
  sku: string
  stages: RoutingStage[]
}

export type PlanStatus =
  | 'Draft'
  | 'Optimizing'
  | 'Generated'
  | 'Under Review'
  | 'Approved'
  | 'Published'
  | 'Executing'
  | 'Completed'
  | 'Rejected'

export interface ScheduleAllocation {
  id: string
  planId: string
  sku: string
  lineId: string
  dayIndex: number // 0 to 27 (4 weeks, 28 days)
  date: string // YYYY-MM-DD
  quantity: number
  shiftHours: number
  changeover: boolean
}

export interface CostBreakdown {
  material: number
  labor: number
  machine: number
  energy: number
  setup: number
  inventory: number
  overtime: number
  shortage: number
  procurement: number
  outsourcing: number
  total: number
}

export interface PlanHistoryEntry {
  status: PlanStatus
  timestamp: string
  userId: string
  userName: string
  role: Role
  note?: string
}

export interface ProductionPlan {
  id: string
  version: number
  name: string
  horizonStart: string
  horizonWeeks: number
  status: PlanStatus
  isBaseline: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  allocations: ScheduleAllocation[]
  cost: CostBreakdown
  savingsVsBaselineAmount?: number
  savingsVsBaselinePercent?: number
  rejectionReason?: string
  overridesApplied: number
  history: PlanHistoryEntry[]
}

export interface ExplainabilityReason {
  id: string
  title: string
  category: 'reallocation' | 'overtime' | 'shortage' | 'energy'
  explanation: string
  impact: string
  relatedSku?: string
  fromLine?: string
  toLine?: string
}

export interface ConstraintSlack {
  id: string
  constraint: string
  binding: boolean
  slack: number
  units: string
  status: 'Binding' | 'Near Limit' | 'Slack'
}

export interface Scenario {
  id: string
  name: string
  basePlanId: string
  scenarioType:
    | 'demand change'
    | 'machine downtime'
    | 'material price change'
    | 'supplier delay'
    | 'labor shortage'
    | 'energy price change'
    | 'capacity expansion'
    | 'overtime policy'
  parameterValue: string
  status: 'Ready' | 'Infeasible'
  cost: CostBreakdown
  productionUnits: number
  inventoryCost: number
  overtimeHours: number
  serviceLevelPercent: number
  averageUtilizationPercent: number
  shortageUnits: number
  savingsVsBaselineAmount: number
  savingsVsBaselinePercent: number
  infeasibilityDiagnostics?: {
    bindingConstraints: string[]
    suggestedRemedies: string[]
  }
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  role: Role
  action: string
  entity: string
  beforeValue?: string
  afterValue: string
  reason?: string
}

export interface DatasetVersion {
  version: string
  committedAt: string
  committedBy: string
  type: 'Inventory Spreadsheets' | 'Master Data'
  rowCount: number
  changesDescription: string
}

export interface UserAccount {
  id: string
  name: string
  email: string
  role: Role
  status: 'Active' | 'Inactive'
  lastLogin: string
}
