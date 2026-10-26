import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  PRODUCTS,
  PRODUCT_BOMS,
  PRODUCT_ROUTINGS,
  PRODUCTION_LINES,
  MACHINES,
  SUPPLIERS,
  MATERIALS,
} from '@/mock/data'
import { StatusBadge } from '@/components/StatusBadge'
import { formatPKR } from '@/mock/selectors'
import {
  Building,
  ChevronRight,
  ChevronDown,
  Edit3,
  X,
  CheckCircle2,
} from 'lucide-react'

export const MasterDataPage: React.FC = () => {
  const { currentRole, logAction } = useAppStore()
  const [activeTab, setActiveTab] = useState<
    'products' | 'bom' | 'routings' | 'factory' | 'machines' | 'suppliers'
  >('products')

  const [expandedBoms, setExpandedBoms] = useState<Record<string, boolean>>({
    'WD-300-HC': true,
    'AC-150-INV': true,
  })

  // Admin edit drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; param: string } | null>(null)
  const [paramValue, setParamValue] = useState('')
  const [editSuccess, setEditSuccess] = useState(false)

  const toggleBom = (sku: string) => {
    setExpandedBoms((prev) => ({ ...prev, [sku]: !prev[sku] }))
  }

  const handleOpenEdit = (id: string, name: string, param: string, initialVal: string) => {
    setEditingItem({ id, name, param })
    setParamValue(initialVal)
    setIsDrawerOpen(true)
    setEditSuccess(false)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    logAction(
      'Update Master Data Parameter',
      `Master Data: ${editingItem.id}`,
      paramValue,
      'Previous Baseline',
      `Admin parameter calibration for ${editingItem.param}`
    )
    setEditSuccess(true)
    setTimeout(() => {
      setIsDrawerOpen(false)
      setEditSuccess(false)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Manufacturing Foundation</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Master Data & Engineering Trees</h1>
          <p className="text-xs text-slate-500 mt-1">Single source of truth for products, multi-level BOMs, routings, and factory topology.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'products' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Products (14)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bom')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'bom' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            BOM Trees
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('routings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'routings' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Routings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('factory')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'factory' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Factory Topology
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('machines')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'machines' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Machines (16)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'suppliers' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Suppliers (5)
          </button>
        </div>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Weekly Demand Target</th>
                <th className="py-3 px-4">Unit Price (PKR)</th>
                {currentRole === 'admin' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PRODUCTS.map((prod) => (
                <tr key={prod.sku} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prod.color }} />
                    {prod.sku}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{prod.name}</td>
                  <td className="py-3 px-4 text-slate-600">{prod.category}</td>
                  <td className="py-3 px-4 font-mono">{prod.targetWeeklyDemand} units/wk</td>
                  <td className="py-3 px-4 font-mono">{formatPKR(prod.unitPricePKR)}</td>
                  {currentRole === 'admin' && (
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(prod.sku, prod.name, 'Weekly Target', String(prod.targetWeeklyDemand))}
                        className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        title="Edit Master Target"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: BOM Trees (Expandable Multi-level with Scrap %) */}
      {activeTab === 'bom' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="text-xs text-slate-500 mb-2">
            Multi-level Bill of Materials with scrap allowance percentages and component substitutions.
          </div>
          <div className="space-y-3">
            {PRODUCT_BOMS.map((bom) => {
              const isExpanded = expandedBoms[bom.sku]
              const prod = PRODUCTS.find((p) => p.sku === bom.sku)
              return (
                <div key={bom.sku} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleBom(bom.sku)}
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left text-xs font-semibold text-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                      <span className="font-mono text-blue-600 font-bold">{bom.sku}</span>
                      <span>— {prod?.name}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {bom.version}
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px] font-normal">
                      {bom.items.length} Component Lines
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white border-t border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-semibold">
                            <th className="py-2 px-3">Level</th>
                            <th className="py-2 px-3">Material ID</th>
                            <th className="py-2 px-3">Component Description</th>
                            <th className="py-2 px-3">Qty / Unit</th>
                            <th className="py-2 px-3">Scrap %</th>
                            <th className="py-2 px-3">Substitute</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bom.items.map((item, idx) => {
                            const mat = MATERIALS.find((m) => m.id === item.materialId)
                            return (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono text-slate-400">L{item.level}</td>
                                <td className="py-2 px-3 font-mono font-semibold text-slate-800">{item.materialId}</td>
                                <td className="py-2 px-3">{mat?.name || item.materialId}</td>
                                <td className="py-2 px-3 font-mono">
                                  {item.quantityPerUnit} {mat?.unit}
                                </td>
                                <td className="py-2 px-3 font-mono text-amber-700">+{item.scrapPercentage}%</td>
                                <td className="py-2 px-3 text-slate-500">
                                  {mat?.substituteMaterialId ? (
                                    <span className="text-emerald-700 font-medium">
                                      Can sub: {mat.substituteMaterialId}
                                    </span>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Routings */}
      {activeTab === 'routings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="space-y-4">
            {PRODUCT_ROUTINGS.slice(0, 4).map((rt) => {
              const prod = PRODUCTS.find((p) => p.sku === rt.sku)
              return (
                <div key={rt.sku} className="border border-slate-200 rounded-xl p-4">
                  <div className="font-bold text-xs text-slate-900 mb-3 flex items-center justify-between">
                    <span>{rt.sku} — {prod?.name}</span>
                    <span className="text-[11px] text-slate-500 font-normal">Standard 4-Stage Routing</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {rt.stages.map((stg, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <div className="font-semibold text-slate-800 capitalize">{stg.stage}</div>
                        <div className="text-[11px] text-slate-500 mt-1">Cycle: {stg.processingMinutesPerUnit} mins/unit</div>
                        <div className="text-[11px] text-slate-500">Setup: {stg.setupMinutes} mins</div>
                        <div className="text-[10px] text-blue-700 font-mono mt-1">{stg.requiredSkill}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Factory Topology */}
      {activeTab === 'factory' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="text-xs text-slate-500 mb-4">
            Hierarchical plant tree: DPL-2 → Production Areas → Lines → Work Centers → Equipment
          </div>
          <div className="space-y-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>DPL-2 Facility</span>
            </div>
            <div className="pl-6 space-y-3 border-l-2 border-slate-300">
              {PRODUCTION_LINES.map((line) => (
                <div key={line.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="font-mono text-blue-600">{line.id}</span>
                    <span>{line.name}</span>
                    {line.bottleneck && (
                      <span className="bg-rose-100 text-rose-700 px-2 py-0.2 rounded font-semibold text-[10px]">
                        Bottleneck Press
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">{line.description}</p>
                  <div className="mt-2 text-[11px] text-slate-600 flex gap-4 font-mono">
                    <span>Capacity: {line.nominalCapacityHoursPerWeek}h / wk</span>
                    <span>Equipment Count: {line.machines.length} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Machines */}
      {activeTab === 'machines' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Machine ID</th>
                <th className="py-3 px-4">Machine Name</th>
                <th className="py-3 px-4">Line Assignment</th>
                <th className="py-3 px-4">Work Center</th>
                <th className="py-3 px-4">Manufacturing Stage</th>
                <th className="py-3 px-4">OEE Efficiency</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MACHINES.map((mc) => (
                <tr key={mc.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{mc.id}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{mc.name}</td>
                  <td className="py-3 px-4 font-mono text-blue-600">{mc.lineId}</td>
                  <td className="py-3 px-4 text-slate-600">{mc.workCenter}</td>
                  <td className="py-3 px-4 capitalize">{mc.stage}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{(mc.efficiency * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4">
                    <StatusBadge status="Active" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUPPLIERS.map((sup) => (
            <div key={sup.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-sm text-slate-900">{sup.name}</div>
                <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  ★ {sup.rating} Rating
                </span>
              </div>
              <div className="text-xs text-slate-500 mb-3">Supplier Code: {sup.id}</div>
              <div className="space-y-2">
                {sup.materials.map((m, i) => {
                  const mat = MATERIALS.find((rm) => rm.id === m.materialId)
                  return (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <div className="font-medium text-slate-800">{mat?.name || m.materialId}</div>
                        <div className="text-[11px] text-slate-400 font-mono">MOQ: {m.moq} {mat?.unit} • Lead time: {m.leadTimeDays}d</div>
                      </div>
                      <div className="font-mono font-semibold text-slate-800">
                        {formatPKR(m.unitCostPKR)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Edit Drawer */}
      {isDrawerOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-96 bg-white h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-sm text-slate-900">Edit Master Parameter</h3>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-500 mb-4">
                Entity: <strong className="text-slate-800">{editingItem.name}</strong> ({editingItem.id})
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {editingItem.param} Value
                  </label>
                  <input
                    type="text"
                    value={paramValue}
                    onChange={(e) => setParamValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  Saving will append an immutable record to the system audit trail.
                </div>

                {editSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Parameter saved and logged!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Commit Parameter Change
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
