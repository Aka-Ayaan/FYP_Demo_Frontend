import type {
  Product,
  ProductionLine,
  Machine,
  Material,
  Supplier,
  ProductBom,
  ProductRouting,
  ProductionPlan,
  Scenario,
  ExplainabilityReason,
  ConstraintSlack,
  AuditLogEntry,
  DatasetVersion,
  UserAccount,
} from './types'

export const HORIZON_START_DATE = '2026-11-02' // Monday 2 Nov 2026
export const HORIZON_WEEKS = 4
export const HORIZON_DAYS = 28
export const PLANT_NAME = 'DPL-2'
export const CURRENT_DATASET_VERSION = 'Dataset v3'

export const PRODUCTS: Product[] = [
  // Water Dispensers
  { sku: 'WD-300-HC', name: '3-Tap Hot & Cold Water Dispenser', category: 'Water Dispenser', unitPricePKR: 42000, targetWeeklyDemand: 420, color: '#0284c7' },
  { sku: 'WD-350-BTM', name: 'Bottom Loading Premium Dispenser', category: 'Water Dispenser', unitPricePKR: 54000, targetWeeklyDemand: 310, color: '#0369a1' },
  { sku: 'WD-200-STD', name: 'Standard 2-Tap Cabinet Dispenser', category: 'Water Dispenser', unitPricePKR: 32000, targetWeeklyDemand: 480, color: '#075985' },
  { sku: 'WD-150-TBL', name: 'Tabletop Compact Water Dispenser', category: 'Water Dispenser', unitPricePKR: 24000, targetWeeklyDemand: 350, color: '#38bdf8' },

  // Air Conditioners
  { sku: 'AC-150-INV', name: 'Inverter Split AC 1.5 Ton', category: 'Air Conditioner', unitPricePKR: 145000, targetWeeklyDemand: 380, color: '#10b981' },
  { sku: 'AC-200-INV', name: 'Inverter Split AC 2.0 Ton', category: 'Air Conditioner', unitPricePKR: 185000, targetWeeklyDemand: 210, color: '#047857' },
  { sku: 'AC-100-STD', name: 'Standard Split AC 1.0 Ton', category: 'Air Conditioner', unitPricePKR: 110000, targetWeeklyDemand: 290, color: '#34d399' },
  { sku: 'AC-150-HT', name: 'Heat & Cool Inverter AC 1.5 Ton', category: 'Air Conditioner', unitPricePKR: 158000, targetWeeklyDemand: 260, color: '#059669' },

  // Washing Machines
  { sku: 'WM-080-FL', name: 'Front Load Automatic Washer 8kg', category: 'Washing Machine', unitPricePKR: 125000, targetWeeklyDemand: 280, color: '#f59e0b' },
  { sku: 'WM-100-TL', name: 'Top Load Automatic Washer 10kg', category: 'Washing Machine', unitPricePKR: 98000, targetWeeklyDemand: 350, color: '#d97706' },
  { sku: 'WM-070-SA', name: 'Semi-Automatic Twin Tub 7kg', category: 'Washing Machine', unitPricePKR: 54000, targetWeeklyDemand: 450, color: '#fbbf24' },

  // Microwave Ovens
  { sku: 'MW-025-GRL', name: 'Digital Grill Microwave 25L', category: 'Microwave Oven', unitPricePKR: 38000, targetWeeklyDemand: 400, color: '#8b5cf6' },
  { sku: 'MW-030-CVN', name: 'Convection Microwave Oven 30L', category: 'Microwave Oven', unitPricePKR: 49000, targetWeeklyDemand: 250, color: '#6d28d9' },
  { sku: 'MW-020-STD', name: 'Manual Solo Microwave 20L', category: 'Microwave Oven', unitPricePKR: 24000, targetWeeklyDemand: 520, color: '#a78bfa' },
]

export const PRODUCTION_LINES: ProductionLine[] = [
  {
    id: 'LINE-01',
    name: 'Line 1 (Water Dispenser Assembly)',
    description: 'Automated sheet bending, PU insulation foaming, and cabinet assembly for water dispensers.',
    bottleneck: false,
    nominalCapacityHoursPerWeek: 168,
    machines: ['MC-01', 'MC-02', 'MC-03', 'MC-04'],
  },
  {
    id: 'LINE-02',
    name: 'Line 2 (AC Assembly)',
    description: 'Indoor & outdoor split unit coil expansion and brazing line.',
    bottleneck: false,
    nominalCapacityHoursPerWeek: 168,
    machines: ['MC-05', 'MC-06', 'MC-07'],
  },
  {
    id: 'LINE-03',
    name: 'Line 3 (Heavy Press & Washers)',
    description: 'Heavy hydraulic stamping press and drum tub assembly. Critical constraint line.',
    bottleneck: true,
    nominalCapacityHoursPerWeek: 168,
    machines: ['MC-08', 'MC-09', 'MC-10'],
  },
  {
    id: 'LINE-04',
    name: 'Line 4 (Flexible Compact)',
    description: 'Versatile swing line for overflow water dispensers, semi-automatic washers, and ACs.',
    bottleneck: false,
    nominalCapacityHoursPerWeek: 168,
    machines: ['MC-11', 'MC-12', 'MC-13'],
  },
  {
    id: 'LINE-05',
    name: 'Line 5 (Microwave & Small Appliances)',
    description: 'High-precision cavity welding, magnetron mounting, and electrical safety testing.',
    bottleneck: false,
    nominalCapacityHoursPerWeek: 168,
    machines: ['MC-14', 'MC-15', 'MC-16'],
  },
]

export const MACHINES: Machine[] = [
  { id: 'MC-01', name: 'Decoiler & Cabinet Press 300T', lineId: 'LINE-01', workCenter: 'WC-101 Sheet Metal', stage: 'sheet-metal forming', status: 'Operational', efficiency: 0.94 },
  { id: 'MC-02', name: 'Water Tank Polyurethane Foamer', lineId: 'LINE-01', workCenter: 'WC-102 Foaming Jig', stage: 'foaming', status: 'Operational', efficiency: 0.96 },
  { id: 'MC-03', name: 'Dispenser Final Assembly Conveyor', lineId: 'LINE-01', workCenter: 'WC-103 Assembly', stage: 'assembly', status: 'Operational', efficiency: 0.92 },
  { id: 'MC-04', name: 'Automated Sanitation & Cooling Test Bay', lineId: 'LINE-01', workCenter: 'WC-104 Test Lab', stage: 'QC', status: 'Operational', efficiency: 0.98 },

  { id: 'MC-05', name: 'Fin Die Punching & Tube Expander', lineId: 'LINE-02', workCenter: 'WC-201 Coil Fab', stage: 'sheet-metal forming', status: 'Operational', efficiency: 0.93 },
  { id: 'MC-06', name: 'Rotary Brazing Table & Assembly', lineId: 'LINE-02', workCenter: 'WC-202 Assembly', stage: 'assembly', status: 'Operational', efficiency: 0.90 },
  { id: 'MC-07', name: 'Electronic Sniffer & Calorimeter Test', lineId: 'LINE-02', workCenter: 'WC-203 QC Bay', stage: 'QC', status: 'Operational', efficiency: 0.95 },

  { id: 'MC-08', name: 'Heavy Stamping Tandem Press 600T', lineId: 'LINE-03', workCenter: 'WC-301 Heavy Press', stage: 'sheet-metal forming', status: 'Operational', efficiency: 0.88 },
  { id: 'MC-09', name: 'Stainless Drum Seam Welder', lineId: 'LINE-03', workCenter: 'WC-302 Drum Fab', stage: 'assembly', status: 'Operational', efficiency: 0.89 },
  { id: 'MC-10', name: 'Vibration & Dynamic Balancing Rig', lineId: 'LINE-03', workCenter: 'WC-303 Washer QC', stage: 'QC', status: 'Operational', efficiency: 0.92 },

  { id: 'MC-11', name: 'CNC Turret Punch Press', lineId: 'LINE-04', workCenter: 'WC-401 Fab', stage: 'sheet-metal forming', status: 'Operational', efficiency: 0.91 },
  { id: 'MC-12', name: 'Secondary Modular Foaming Fixture', lineId: 'LINE-04', workCenter: 'WC-402 Foaming', stage: 'foaming', status: 'Operational', efficiency: 0.89 },
  { id: 'MC-13', name: 'Multi-Product Final Assembly Track', lineId: 'LINE-04', workCenter: 'WC-403 Flex Line', stage: 'assembly', status: 'Operational', efficiency: 0.94 },

  { id: 'MC-14', name: 'Cavity Precision Robotic Welder', lineId: 'LINE-05', workCenter: 'WC-501 Cavity Weld', stage: 'sheet-metal forming', status: 'Operational', efficiency: 0.96 },
  { id: 'MC-15', name: 'Door Latch & High-Voltage Assembly', lineId: 'LINE-05', workCenter: 'WC-502 Assembly', stage: 'assembly', status: 'Operational', efficiency: 0.93 },
  { id: 'MC-16', name: 'Microwave RF Emission & Dielectric Test', lineId: 'LINE-05', workCenter: 'WC-503 RF Lab', stage: 'QC', status: 'Operational', efficiency: 0.97 },
]

export const MATERIALS: Material[] = [
  // Metals & Sheets
  { id: 'RM-101', name: 'Cold Rolled Steel Sheet 0.7mm', category: 'Metals & Sheets', unit: 'kg', unitCostPKR: 280, stockOnHand: 48000, safetyStock: 15000, reservedStock: 32000 },
  { id: 'RM-102', name: 'Seamless Copper Tubing 3/8"', category: 'Metals & Sheets', unit: 'meters', unitCostPKR: 850, stockOnHand: 3400, safetyStock: 8000, reservedStock: 7900 }, // Shortage material!
  { id: 'RM-103', name: 'Aluminum Hydrophilic Foil', category: 'Metals & Sheets', unit: 'kg', unitCostPKR: 920, stockOnHand: 14000, safetyStock: 5000, reservedStock: 8200 },
  { id: 'RM-104', name: 'Galvanized Structural Brackets', category: 'Metals & Sheets', unit: 'pcs', unitCostPKR: 195, stockOnHand: 22000, safetyStock: 6000, reservedStock: 12500 },

  // Chemicals & Insulation
  { id: 'RM-201', name: 'Polyol Blend (Rigid Foam)', category: 'Chemicals & Insulation', unit: 'liters', unitCostPKR: 440, stockOnHand: 18500, safetyStock: 6000, reservedStock: 11000 },
  { id: 'RM-202', name: 'Polymeric MDI Isocyanate', category: 'Chemicals & Insulation', unit: 'liters', unitCostPKR: 560, stockOnHand: 19000, safetyStock: 6500, reservedStock: 11500 },
  { id: 'RM-203', name: 'Eco Refrigerant R600a', category: 'Chemicals & Insulation', unit: 'cylinders', unitCostPKR: 8200, stockOnHand: 240, safetyStock: 80, reservedStock: 160 },
  { id: 'RM-204', name: 'Inverter Refrigerant R32', category: 'Chemicals & Insulation', unit: 'cylinders', unitCostPKR: 14500, stockOnHand: 180, safetyStock: 70, reservedStock: 140 },
  { id: 'RM-205', name: 'Pure White Epoxy Powder Coat', category: 'Chemicals & Insulation', unit: 'kg', unitCostPKR: 620, stockOnHand: 6500, safetyStock: 2500, reservedStock: 4100 },

  // Electrical & Electronics
  { id: 'RM-301', name: 'Mini Dispenser Cooling Compressor 1/10HP', category: 'Electrical & Electronics', unit: 'pcs', unitCostPKR: 9500, stockOnHand: 2200, safetyStock: 600, reservedStock: 1400 },
  { id: 'RM-302', name: 'Standard Reciprocating Compressor', category: 'Electrical & Electronics', unit: 'pcs', unitCostPKR: 11200, stockOnHand: 900, safetyStock: 400, reservedStock: 650 },
  { id: 'RM-303', name: 'Rotary Inverter Compressor 1.5T', category: 'Electrical & Electronics', unit: 'pcs', unitCostPKR: 26000, stockOnHand: 620, safetyStock: 300, reservedStock: 580 },
  { id: 'RM-304', name: 'Smart Inverter Main PCB Board', category: 'Electrical & Electronics', unit: 'pcs', unitCostPKR: 5400, stockOnHand: 2800, safetyStock: 1000, reservedStock: 2200 },
  { id: 'RM-305', name: 'Standard Microcontroller Board', category: 'Electrical & Electronics', unit: 'pcs', unitCostPKR: 3200, stockOnHand: 3100, safetyStock: 1200, reservedStock: 2400, substituteMaterialId: 'RM-304' }, // Substitute material!
  { id: 'RM-306', name: 'BLDC Direct Drive Motor 800W', category: 'Electrical & Electronics', unit: 'pcs', unitCostPKR: 14800, stockOnHand: 740, safetyStock: 350, reservedStock: 690 },
  { id: 'RM-307', name: 'High-Efficiency Magnetron 900W', category: 'Electrical & Electronics', unit: 'pcs', unitCostPKR: 4200, stockOnHand: 1400, safetyStock: 500, reservedStock: 1150 },
  { id: 'RM-308', name: 'Copper Wiring Harness Bundle', category: 'Electrical & Electronics', unit: 'sets', unitCostPKR: 1150, stockOnHand: 5200, safetyStock: 2000, reservedStock: 3900 },

  // Plastics & Moulding
  { id: 'RM-401', name: 'High-Impact ABS Plastic Granules', category: 'Plastics & Moulding', unit: 'kg', unitCostPKR: 410, stockOnHand: 15400, safetyStock: 5000, reservedStock: 9800 },
  { id: 'RM-402', name: 'Food-Grade Silicon Faucet & Valve Kit', category: 'Plastics & Moulding', unit: 'sets', unitCostPKR: 450, stockOnHand: 3800, safetyStock: 1200, reservedStock: 2500 },
  { id: 'RM-403', name: 'Food-Grade Stainless Water Tank SS304', category: 'Plastics & Moulding', unit: 'pcs', unitCostPKR: 2800, stockOnHand: 4200, safetyStock: 1500, reservedStock: 3100 },

  // Packaging & Fasteners
  { id: 'RM-501', name: 'Heavy 7-Ply Corrugated Cartons', category: 'Packaging & Fasteners', unit: 'pcs', unitCostPKR: 680, stockOnHand: 4800, safetyStock: 2000, reservedStock: 4200 },
  { id: 'RM-502', name: 'Expanded EPS Cushioning Blocks', category: 'Packaging & Fasteners', unit: 'sets', unitCostPKR: 320, stockOnHand: 5600, safetyStock: 2000, reservedStock: 4500 },
]

export const SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-A',
    name: 'Supplier A (Prime Steel & Metals)',
    rating: 4.8,
    materials: [
      { materialId: 'RM-101', unitCostPKR: 280, moq: 5000, leadTimeDays: 7, monthlyCapacity: 80000 },
      { materialId: 'RM-104', unitCostPKR: 195, moq: 2000, leadTimeDays: 5, monthlyCapacity: 35000 },
    ],
  },
  {
    id: 'SUP-B',
    name: 'Supplier B (Thermal & Tubes Co.)',
    rating: 3.9,
    materials: [
      { materialId: 'RM-102', unitCostPKR: 850, moq: 1500, leadTimeDays: 14, monthlyCapacity: 12000 },
      { materialId: 'RM-103', unitCostPKR: 920, moq: 2000, leadTimeDays: 10, monthlyCapacity: 25000 },
    ],
  },
  {
    id: 'SUP-C',
    name: 'Supplier C (Polymer & Chemical Works)',
    rating: 4.6,
    materials: [
      { materialId: 'RM-201', unitCostPKR: 440, moq: 3000, leadTimeDays: 6, monthlyCapacity: 35000 },
      { materialId: 'RM-202', unitCostPKR: 560, moq: 3000, leadTimeDays: 6, monthlyCapacity: 35000 },
      { materialId: 'RM-203', unitCostPKR: 8200, moq: 50, leadTimeDays: 8, monthlyCapacity: 600 },
      { materialId: 'RM-204', unitCostPKR: 14500, moq: 40, leadTimeDays: 8, monthlyCapacity: 500 },
    ],
  },
  {
    id: 'SUP-D',
    name: 'Supplier D (Micro-Electro & Compressors)',
    rating: 4.9,
    materials: [
      { materialId: 'RM-301', unitCostPKR: 9500, moq: 200, leadTimeDays: 12, monthlyCapacity: 3000 },
      { materialId: 'RM-303', unitCostPKR: 26000, moq: 150, leadTimeDays: 15, monthlyCapacity: 2000 },
      { materialId: 'RM-304', unitCostPKR: 5400, moq: 500, leadTimeDays: 9, monthlyCapacity: 8000 },
      { materialId: 'RM-306', unitCostPKR: 14800, moq: 150, leadTimeDays: 12, monthlyCapacity: 2500 },
    ],
  },
  {
    id: 'SUP-E',
    name: 'Supplier E (Industrial Packaging & Resins)',
    rating: 4.4,
    materials: [
      { materialId: 'RM-401', unitCostPKR: 410, moq: 2500, leadTimeDays: 4, monthlyCapacity: 30000 },
      { materialId: 'RM-402', unitCostPKR: 450, moq: 1000, leadTimeDays: 5, monthlyCapacity: 15000 },
      { materialId: 'RM-403', unitCostPKR: 2800, moq: 500, leadTimeDays: 7, monthlyCapacity: 8000 },
      { materialId: 'RM-501', unitCostPKR: 680, moq: 1000, leadTimeDays: 3, monthlyCapacity: 20000 },
      { materialId: 'RM-502', unitCostPKR: 320, moq: 1000, leadTimeDays: 3, monthlyCapacity: 20000 },
    ],
  },
]

export const PRODUCT_BOMS: ProductBom[] = PRODUCTS.map((prod) => {
  const isDispenser = prod.category === 'Water Dispenser'
  const isAC = prod.category === 'Air Conditioner'
  const isWasher = prod.category === 'Washing Machine'
  const isMicro = prod.category === 'Microwave Oven'

  const items = [
    { materialId: 'RM-101', quantityPerUnit: isDispenser ? 12 : isAC ? 14 : isWasher ? 18 : 8, scrapPercentage: 2.5, level: 1 },
    { materialId: 'RM-501', quantityPerUnit: 1, scrapPercentage: 1.0, level: 1 },
    { materialId: 'RM-502', quantityPerUnit: 1, scrapPercentage: 1.0, level: 1 },
    { materialId: 'RM-308', quantityPerUnit: 1, scrapPercentage: 1.5, level: 1 },
  ]

  if (isDispenser) {
    items.push(
      { materialId: 'RM-201', quantityPerUnit: 4.2, scrapPercentage: 2.0, level: 2 },
      { materialId: 'RM-202', quantityPerUnit: 4.5, scrapPercentage: 2.0, level: 2 },
      { materialId: 'RM-301', quantityPerUnit: 1, scrapPercentage: 0.5, level: 1 },
      { materialId: 'RM-203', quantityPerUnit: 0.04, scrapPercentage: 3.0, level: 2 },
      { materialId: 'RM-402', quantityPerUnit: 1, scrapPercentage: 1.0, level: 2 },
      { materialId: 'RM-403', quantityPerUnit: 1, scrapPercentage: 0.5, level: 2 },
    )
  } else if (isAC) {
    items.push(
      { materialId: 'RM-102', quantityPerUnit: 6.5, scrapPercentage: 3.5, level: 1 },
      { materialId: 'RM-103', quantityPerUnit: 4.2, scrapPercentage: 2.0, level: 2 },
      { materialId: 'RM-303', quantityPerUnit: 1, scrapPercentage: 0.5, level: 1 },
      { materialId: 'RM-204', quantityPerUnit: 0.12, scrapPercentage: 3.0, level: 2 },
      { materialId: 'RM-304', quantityPerUnit: 1, scrapPercentage: 0.5, level: 1 },
    )
  } else if (isWasher) {
    items.push(
      { materialId: 'RM-306', quantityPerUnit: 1, scrapPercentage: 0.5, level: 1 },
      { materialId: 'RM-304', quantityPerUnit: 1, scrapPercentage: 0.5, level: 1 },
      { materialId: 'RM-401', quantityPerUnit: 6.5, scrapPercentage: 2.0, level: 2 },
      { materialId: 'RM-104', quantityPerUnit: 4, scrapPercentage: 1.0, level: 2 },
    )
  } else if (isMicro) {
    items.push(
      { materialId: 'RM-307', quantityPerUnit: 1, scrapPercentage: 0.5, level: 1 },
      { materialId: 'RM-305', quantityPerUnit: 1, scrapPercentage: 0.5, level: 1 },
      { materialId: 'RM-401', quantityPerUnit: 3.2, scrapPercentage: 2.0, level: 2 },
    )
  }

  return {
    sku: prod.sku,
    version: 'BOM-v2.4',
    items,
  }
})

export const PRODUCT_ROUTINGS: ProductRouting[] = PRODUCTS.map((prod) => ({
  sku: prod.sku,
  stages: [
    { stage: 'sheet-metal forming', workCenter: 'WC-01', processingMinutesPerUnit: 4.5, setupMinutes: 30, requiredSkill: 'Press Operator Grade II' },
    { stage: 'foaming', workCenter: 'WC-02', processingMinutesPerUnit: 6.0, setupMinutes: 45, requiredSkill: 'Chemical Dispenser Certified' },
    { stage: 'assembly', workCenter: 'WC-03', processingMinutesPerUnit: 12.0, setupMinutes: 20, requiredSkill: 'Electromechanical Assembler' },
    { stage: 'QC', workCenter: 'WC-04', processingMinutesPerUnit: 3.5, setupMinutes: 10, requiredSkill: 'Quality Inspector Certified' },
  ],
}))

export const USERS: UserAccount[] = [
  { id: 'usr-1', name: 'Zainab Tariq', email: 'zainab.t@example.com', role: 'admin', status: 'Active', lastLogin: '10 mins ago' },
  { id: 'usr-2', name: 'Kamran Ali', email: 'kamran.a@example.com', role: 'admin', status: 'Active', lastLogin: '2 days ago' },
  { id: 'usr-3', name: 'Usman Farooq', email: 'usman.f@example.com', role: 'planner', status: 'Active', lastLogin: 'Just now' },
  { id: 'usr-4', name: 'Hina Siddiqui', email: 'hina.s@example.com', role: 'planner', status: 'Active', lastLogin: '3 hours ago' },
  { id: 'usr-5', name: 'Tariq Mehmood', email: 'tariq.m@example.com', role: 'production_manager', status: 'Active', lastLogin: '1 hour ago' },
  { id: 'usr-6', name: 'Raza Jamil', email: 'raza.j@example.com', role: 'production_manager', status: 'Active', lastLogin: 'Yesterday' },
  { id: 'usr-7', name: 'Bilal Ahmed', email: 'bilal.a@example.com', role: 'inventory', status: 'Active', lastLogin: '15 mins ago' },
  { id: 'usr-8', name: 'Nida Aslam', email: 'nida.a@example.com', role: 'inventory', status: 'Active', lastLogin: '4 hours ago' },
]

export const DATASET_VERSIONS: DatasetVersion[] = [
  {
    version: 'Dataset v1',
    committedAt: '2026-10-10 09:30',
    committedBy: 'Zainab Tariq (Admin)',
    type: 'Master Data',
    rowCount: 142,
    changesDescription: 'Initial plant baseline configuration and BOM tree initialization.',
  },
  {
    version: 'Dataset v2',
    committedAt: '2026-10-20 14:15',
    committedBy: 'Bilal Ahmed (Inventory)',
    type: 'Inventory Spreadsheets',
    rowCount: 28,
    changesDescription: 'Weekly physical stock audit adjustment for RM-101 and RM-201.',
  },
  {
    version: 'Dataset v3',
    committedAt: '2026-10-24 16:40',
    committedBy: 'Bilal Ahmed (Inventory)',
    type: 'Inventory Spreadsheets',
    rowCount: 22,
    changesDescription: 'Uploaded Q4 supplier receipt confirmation and copper tubing deficit update.',
  },
]

// Seed Allocations generator for 4 weeks (28 days)
function generateSeedAllocations(planId: string, isOptimized: boolean): import('./types').ScheduleAllocation[] {
  const allocations: import('./types').ScheduleAllocation[] = []
  let allocCounter = 1

  // Day dates from HORIZON_START_DATE
  const baseDate = new Date(HORIZON_START_DATE)

  // Line 1: Water Dispensers
  for (let day = 0; day < 28; day++) {
    const curDate = new Date(baseDate)
    curDate.setDate(curDate.getDate() + day)
    const dateStr = curDate.toISOString().split('T')[0]
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6
    if (isWeekend) continue

    const sku = day % 4 === 0 ? 'WD-300-HC' : day % 4 === 1 ? 'WD-350-BTM' : day % 4 === 2 ? 'WD-200-STD' : 'WD-150-TBL'
    const qty = isOptimized ? (day % 3 === 0 ? 110 : 95) : 85
    allocations.push({
      id: `AL-${planId}-${allocCounter++}`,
      planId,
      sku,
      lineId: 'LINE-01',
      dayIndex: day,
      date: dateStr,
      quantity: qty,
      shiftHours: isOptimized ? 8 : 9,
      changeover: day % 4 === 0,
    })
  }

  // Line 2: ACs
  for (let day = 0; day < 28; day++) {
    const curDate = new Date(baseDate)
    curDate.setDate(curDate.getDate() + day)
    const dateStr = curDate.toISOString().split('T')[0]
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6
    if (isWeekend) continue

    const sku = day % 3 === 0 ? 'AC-150-INV' : day % 3 === 1 ? 'AC-200-INV' : 'AC-100-STD'
    const qty = isOptimized ? 75 : 68
    allocations.push({
      id: `AL-${planId}-${allocCounter++}`,
      planId,
      sku,
      lineId: 'LINE-02',
      dayIndex: day,
      date: dateStr,
      quantity: qty,
      shiftHours: 8,
      changeover: day % 5 === 0,
    })
  }

  // Line 3: Washers (Bottleneck Line: near 97% on optimized!)
  for (let day = 0; day < 28; day++) {
    const curDate = new Date(baseDate)
    curDate.setDate(curDate.getDate() + day)
    const dateStr = curDate.toISOString().split('T')[0]
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6
    if (isWeekend) continue

    // On baseline, some WM-070-SA runs here causing overtime
    const sku = isOptimized ? (day % 2 === 0 ? 'WM-080-FL' : 'WM-100-TL') : (day % 3 === 0 ? 'WM-080-FL' : day % 3 === 1 ? 'WM-100-TL' : 'WM-070-SA')
    const qty = isOptimized ? 92 : 80
    allocations.push({
      id: `AL-${planId}-${allocCounter++}`,
      planId,
      sku,
      lineId: 'LINE-03',
      dayIndex: day,
      date: dateStr,
      quantity: qty,
      shiftHours: isOptimized ? 10 : 11, // High hours = bottleneck 97%
      changeover: day % 6 === 0,
    })
  }

  // Line 4: Flexible Compact (reallocated WM-070-SA on optimized plan to relieve Line 3)
  for (let day = 0; day < 28; day++) {
    const curDate = new Date(baseDate)
    curDate.setDate(curDate.getDate() + day)
    const dateStr = curDate.toISOString().split('T')[0]
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6
    if (isWeekend) continue

    const sku = isOptimized ? (day % 2 === 0 ? 'WM-070-SA' : 'AC-150-HT') : (day % 2 === 0 ? 'AC-150-HT' : 'WD-150-TBL')
    const qty = isOptimized ? 85 : 70
    allocations.push({
      id: `AL-${planId}-${allocCounter++}`,
      planId,
      sku,
      lineId: 'LINE-04',
      dayIndex: day,
      date: dateStr,
      quantity: qty,
      shiftHours: 8,
      changeover: day % 4 === 0,
    })
  }

  // Line 5: Microwave
  for (let day = 0; day < 28; day++) {
    const curDate = new Date(baseDate)
    curDate.setDate(curDate.getDate() + day)
    const dateStr = curDate.toISOString().split('T')[0]
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6
    if (isWeekend) continue

    const sku = day % 3 === 0 ? 'MW-025-GRL' : day % 3 === 1 ? 'MW-030-CVN' : 'MW-020-STD'
    const qty = isOptimized ? 130 : 110
    allocations.push({
      id: `AL-${planId}-${allocCounter++}`,
      planId,
      sku,
      lineId: 'LINE-05',
      dayIndex: day,
      date: dateStr,
      quantity: qty,
      shiftHours: 8,
      changeover: day % 5 === 0,
    })
  }

  return allocations
}

// 10 exact cost components in PKR (sums must be exact!)
// Baseline total = 184,500,000 PKR (~184.5M PKR)
export const BASELINE_COST = {
  material: 98400000,
  labor: 24600000,
  machine: 17200000,
  energy: 12300000,
  setup: 4100000,
  inventory: 6800000,
  overtime: 9200000,
  shortage: 5400000,
  procurement: 3900000,
  outsourcing: 2600000,
  total: 184500000, // 98.4+24.6+17.2+12.3+4.1+6.8+9.2+5.4+3.9+2.6 = 184.5M
}

// Optimized total = 173,430,000 PKR (~173.43M PKR)
// Savings = 184,500,000 - 173,430,000 = 11,070,000 PKR (exactly 6.00% below baseline, satisfying 4-8% range)
export const OPTIMIZED_COST = {
  material: 95200000,
  labor: 23800000,
  machine: 16800000,
  energy: 11900000,
  setup: 2850000,
  inventory: 5400000,
  overtime: 5600000,
  shortage: 2100000,
  procurement: 7280000,
  outsourcing: 2500000,
  total: 173430000, // 95.2+23.8+16.8+11.9+2.85+5.4+5.6+2.1+7.28+2.5 = 173.43M
}

export const SEED_PLANS: ProductionPlan[] = [
  {
    id: 'P-2026-BASE',
    version: 1,
    name: 'Q4 Baseline Operational Plan',
    horizonStart: HORIZON_START_DATE,
    horizonWeeks: HORIZON_WEEKS,
    status: 'Completed',
    isBaseline: true,
    createdAt: '2026-10-22 09:00',
    updatedAt: '2026-10-22 09:00',
    createdBy: 'Usman Farooq (Planner)',
    allocations: generateSeedAllocations('P-2026-BASE', false),
    cost: BASELINE_COST,
    overridesApplied: 0,
    history: [
      { status: 'Draft', timestamp: '2026-10-21 16:00', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner' },
      { status: 'Completed', timestamp: '2026-10-22 09:00', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', note: 'Baseline loaded from SAP staging upload.' },
    ],
  },
  {
    id: 'P-2026-W45',
    version: 1,
    name: 'Q4 MILP Optimized Schedule (W45-W48)',
    horizonStart: HORIZON_START_DATE,
    horizonWeeks: HORIZON_WEEKS,
    status: 'Under Review',
    isBaseline: false,
    createdAt: '2026-10-24 11:20',
    updatedAt: '2026-10-24 15:45',
    createdBy: 'Usman Farooq (Planner)',
    allocations: generateSeedAllocations('P-2026-W45', true),
    cost: OPTIMIZED_COST,
    savingsVsBaselineAmount: 11070000,
    savingsVsBaselinePercent: 6.0,
    overridesApplied: 0,
    history: [
      { status: 'Draft', timestamp: '2026-10-24 10:00', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner' },
      { status: 'Optimizing', timestamp: '2026-10-24 11:15', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner' },
      { status: 'Generated', timestamp: '2026-10-24 11:20', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', note: 'Solver converged with 0.42% MIP gap.' },
      { status: 'Under Review', timestamp: '2026-10-24 15:45', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', note: 'Submitted to Production Manager for approval.' },
    ],
  },
]

export const EXPLAINABILITY_REASONS: ExplainabilityReason[] = [
  {
    id: 'EXP-01',
    title: 'Product Reallocation: WM-070-SA to Line 4',
    category: 'reallocation',
    explanation: 'Semi-Automatic Washer (WM-070-SA) was moved from Line 3 to Line 4 because Line 3 heavy stamping was at 97% capacity while Line 4 had 26% available flex capacity.',
    impact: 'Avoided 34 hours of expensive Line 3 weekend overtime penalty.',
    relatedSku: 'WM-070-SA',
    fromLine: 'LINE-03',
    toLine: 'LINE-04',
  },
  {
    id: 'EXP-02',
    title: 'Strategic Overtime Scheduling on Line 3',
    category: 'overtime',
    explanation: 'A 2-hour daily overtime shift was scheduled on Line 3 during Week 2 rather than splitting batches across multiple lines.',
    impact: 'Overtime cost (PKR 480,000) was 62% cheaper than incurring Line 1 changeover setup penalties and delivery delay penalties.',
    relatedSku: 'WM-080-FL',
    fromLine: 'LINE-03',
  },
  {
    id: 'EXP-03',
    title: 'Early Supplier Replenishment Order for Copper Tubing',
    category: 'shortage',
    explanation: 'Expedited purchase order dispatched to Supplier B for Seamless Copper Tubing (RM-102) with 14-day lead time.',
    impact: 'Prevents split-system AC assembly stoppage scheduled for Day 18.',
    relatedSku: 'AC-150-INV',
  },
  {
    id: 'EXP-04',
    title: 'Energy Peak-Shaving Batch Sequencing',
    category: 'energy',
    explanation: 'High-draw hydraulic press operations on Line 1 shifted from 17:00–21:00 peak tariff window to off-peak morning shifts (07:00–12:00).',
    impact: 'Reduced industrial electricity peak tariff surcharge by PKR 400,000.',
    fromLine: 'LINE-01',
  },
]

export const CONSTRAINT_SLACK_DATA: ConstraintSlack[] = [
  { id: 'CST-01', constraint: 'Line 3 Heavy Stamping Max Weekly Machine-Hours', binding: true, slack: 4.8, units: 'hours/week', status: 'Binding' },
  { id: 'CST-02', constraint: 'RM-102 Seamless Copper Tubing Available Stock', binding: true, slack: 0, units: 'meters', status: 'Binding' },
  { id: 'CST-03', constraint: 'Line 1 High-Pressure Foaming Weekly Limit', binding: false, slack: 21.5, units: 'hours/week', status: 'Slack' },
  { id: 'CST-04', constraint: 'Max Allowed Overtime Hours per Worker', binding: false, slack: 6.0, units: 'hours/week', status: 'Near Limit' },
  { id: 'CST-05', constraint: 'Supplier D Monthly BLDC Motor Quota', binding: false, slack: 310, units: 'pcs/month', status: 'Slack' },
  { id: 'CST-06', constraint: 'Warehouse Finished Goods Storage Capacity', binding: false, slack: 1250, units: 'pallets', status: 'Slack' },
]

export const SEED_SCENARIOS: Scenario[] = [
  {
    id: 'SCN-01',
    name: 'Demand Increase (+15% Seasonal Spike)',
    basePlanId: 'P-2026-W45',
    scenarioType: 'demand change',
    parameterValue: '+15%',
    status: 'Ready',
    cost: {
      ...OPTIMIZED_COST,
      overtime: OPTIMIZED_COST.overtime + 1400000,
      energy: OPTIMIZED_COST.energy + 800000,
      total: OPTIMIZED_COST.total + 2200000,
    },
    productionUnits: 14200,
    inventoryCost: 6100000,
    overtimeHours: 148,
    serviceLevelPercent: 98.4,
    averageUtilizationPercent: 88.5,
    shortageUnits: 0,
    savingsVsBaselineAmount: 8870000,
    savingsVsBaselinePercent: 4.8,
  },
  {
    id: 'SCN-02',
    name: 'Line 3 Unplanned Downtime (20% reduction)',
    basePlanId: 'P-2026-W45',
    scenarioType: 'machine downtime',
    parameterValue: '-20% Line 3 Capacity',
    status: 'Ready',
    cost: {
      ...OPTIMIZED_COST,
      outsourcing: OPTIMIZED_COST.outsourcing + 1900000,
      shortage: OPTIMIZED_COST.shortage + 1100000,
      total: OPTIMIZED_COST.total + 3000000,
    },
    productionUnits: 12100,
    inventoryCost: 4900000,
    overtimeHours: 196,
    serviceLevelPercent: 93.8,
    averageUtilizationPercent: 92.1,
    shortageUnits: 280,
    savingsVsBaselineAmount: 8070000,
    savingsVsBaselinePercent: 4.4,
  },
  {
    id: 'SCN-03',
    name: 'Extreme Demand Surge (+40% Infeasible Test)',
    basePlanId: 'P-2026-W45',
    scenarioType: 'demand change',
    parameterValue: '+40% Volume Surge',
    status: 'Infeasible',
    cost: {
      ...OPTIMIZED_COST,
      shortage: 28400000,
      total: OPTIMIZED_COST.total + 34000000,
    },
    productionUnits: 16900,
    inventoryCost: 8200000,
    overtimeHours: 240,
    serviceLevelPercent: 78.2,
    averageUtilizationPercent: 99.8,
    shortageUnits: 1850,
    savingsVsBaselineAmount: 0,
    savingsVsBaselinePercent: 0,
    infeasibilityDiagnostics: {
      bindingConstraints: [
        'Production plan is infeasible because Line 3 lacks 84 machine-hours required to satisfy Product B (WM-080-FL) demand within the 4-week horizon.',
        'Material RM-102 (Seamless Copper Tubing) is short by 4,500 units; earliest supplier replenishment is 12 days after required production date.',
        'Regulatory limit reached: Maximum allowed workforce overtime exceeded by 52 hours/week.',
      ],
      suggestedRemedies: [
        'Authorize 120 hours of weekend premium overtime across stamping lines.',
        'Shift secondary models from Line 3 to alternative Line 4 flex stamping center.',
        'Engage pre-qualified sub-contractor for tub stamping outsourcing.',
        'Draw down 800 units of safety stock for copper tubing from central hub.',
        'Negotiate staggered split-delivery schedule with key retail distributors.',
      ],
    },
  },
]

export const SEED_AUDIT_LOG: AuditLogEntry[] = [
  { id: 'AUD-01', timestamp: '2026-10-24 16:40:12', userId: 'usr-7', userName: 'Bilal Ahmed', role: 'inventory', action: 'Commit Spreadsheet Import', entity: 'Inventory Dataset', beforeValue: 'Dataset v2', afterValue: 'Dataset v3', reason: 'Physical count adjustment uploaded' },
  { id: 'AUD-02', timestamp: '2026-10-24 15:45:30', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', action: 'Submit Plan for Approval', entity: 'Plan P-2026-W45', beforeValue: 'Generated', afterValue: 'Under Review', reason: 'Submitted to Production Manager for Q4 execution sign-off' },
  { id: 'AUD-03', timestamp: '2026-10-24 15:30:18', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', action: 'Apply Allocation Override', entity: 'Line 4 Schedule', beforeValue: 'AC-150-HT Day 12', afterValue: 'WM-070-SA Day 12', reason: 'Accommodate promotional order surge for twin-tub washers' },
  { id: 'AUD-04', timestamp: '2026-10-24 11:20:05', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', action: 'MILP Optimization Solved', entity: 'Plan P-2026-W45', beforeValue: 'Optimizing', afterValue: 'Generated', reason: 'Solver completed in 4.8s with 6.0% cost reduction' },
  { id: 'AUD-05', timestamp: '2026-10-24 11:15:22', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', action: 'Trigger Optimization Run', entity: 'Optimization Job #849', afterValue: 'Queued', reason: 'Scheduled monthly planning cycle' },
  { id: 'AUD-06', timestamp: '2026-10-24 09:12:44', userId: 'usr-1', userName: 'Zainab Tariq', role: 'admin', action: 'Update Cost Parameter', entity: 'Peak Energy Rate', beforeValue: '34.50 PKR/kWh', afterValue: '38.20 PKR/kWh', reason: 'Quarterly utility tariff adjustment' },
  { id: 'AUD-07', timestamp: '2026-10-23 17:05:00', userId: 'usr-5', userName: 'Tariq Mehmood', role: 'production_manager', action: 'Review Schedule Telemetry', entity: 'Line 3 Bottleneck Report', afterValue: 'Acknowledged', reason: 'Reviewed 97% load factor' },
  { id: 'AUD-08', timestamp: '2026-10-23 14:22:15', userId: 'usr-7', userName: 'Bilal Ahmed', role: 'inventory', action: 'Stock Alert Flagged', entity: 'RM-102 Seamless Copper Tubing', beforeValue: 'Adequate', afterValue: 'Stock-out Risk Alert', reason: 'Stock level dipped below safety stock threshold (3,400 < 8,000)' },
  { id: 'AUD-09', timestamp: '2026-10-23 11:40:02', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', action: 'Run Forecast Engine', entity: 'Demand Model', beforeValue: 'WAPE 8.4%', afterValue: 'WAPE 6.1% (Ensemble)', reason: 'Seasonal cooling product demand calibration' },
  { id: 'AUD-10', timestamp: '2026-10-22 16:30:19', userId: 'usr-1', userName: 'Zainab Tariq', role: 'admin', action: 'Modify User Role', entity: 'User usr-4 Hina Siddiqui', beforeValue: 'Viewer', afterValue: 'Planner', reason: 'Promoted to planning team' },
  { id: 'AUD-11', timestamp: '2026-10-22 09:00:00', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', action: 'Lock Baseline Plan', entity: 'Plan P-2026-BASE', beforeValue: 'Draft', afterValue: 'Completed', reason: 'Baseline benchmark established for horizon' },
  { id: 'AUD-12', timestamp: '2026-10-21 14:10:45', userId: 'usr-5', userName: 'Tariq Mehmood', role: 'production_manager', action: 'Reject Previous Plan', entity: 'Plan P-2026-W44', beforeValue: 'Under Review', afterValue: 'Rejected', reason: 'Line 3 overtime allocation was excessive; request re-balancing with Line 4' },
  { id: 'AUD-13', timestamp: '2026-10-20 15:30:00', userId: 'usr-7', userName: 'Bilal Ahmed', role: 'inventory', action: 'Stage Upload Validation', entity: 'Batch #502', beforeValue: 'Uploaded', afterValue: 'Validated (3 warnings)', reason: '2 negative values and 1 unknown SKU skipped' },
  { id: 'AUD-14', timestamp: '2026-10-19 10:15:20', userId: 'usr-1', userName: 'Zainab Tariq', role: 'admin', action: 'Update Routing Parameter', entity: 'Line 3 Tandem Press 600T', beforeValue: 'Setup 45m', afterValue: 'Setup 35m', reason: 'SMED tooling optimization recorded' },
  { id: 'AUD-15', timestamp: '2026-10-18 11:00:00', userId: 'usr-3', userName: 'Usman Farooq', role: 'planner', action: 'Create What-if Scenario', entity: 'Scenario SCN-01', afterValue: 'Simulated', reason: 'Evaluate 15% seasonal volume surge' },
]
