import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge } from '@/components/StatusBadge'
import { PRODUCT_BOMS, SUPPLIERS } from '@/mock/data'
import { calculateMaterialRequirements } from '@/mock/selectors'
import {
  AlertTriangle,
  ShoppingCart,
  Truck,
} from 'lucide-react'

export const MaterialRequirementsPage: React.FC = () => {
  const { plans, materials, activePlanId } = useAppStore()
  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0]

  const requirements = calculateMaterialRequirements(
    activePlan,
    materials,
    PRODUCT_BOMS,
    SUPPLIERS
  )

  const shortages = requirements.filter((r) => r.status === 'Stock-out Risk')
  const recommendedPurchases = requirements.filter((r) => r.recommendedPurchaseQty > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Materials Planning</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Material Requirements & Shortage Analysis</h1>
          <p className="text-xs text-slate-500 mt-1">
            BOM exploded requirements for active plan <span className="font-mono font-bold text-slate-800">{activePlan.id}</span>. Read-only advisory view.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
            Read-Only (No Procurement Role)
          </span>
        </div>
      </div>

      {/* Critical Shortage Alert Banner if shortages exist */}
      {shortages.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                Critical Material Shortage Identified ({shortages.length} Item)
              </h3>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Seamless Copper Tubing 3/8" (RM-102) has 3,400 meters on hand vs required production demand of 7,900 meters. Earliest replenishment from Supplier B requires 14 calendar days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Purchase Orders Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-semibold text-sm text-slate-900 mb-1 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-blue-600" />
          Recommended Purchase Orders (Replenishment Advice)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Automated quantity calculations based on safety stock buffers and supplier MOQ rules.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedPurchases.map((rec) => (
            <div key={rec.materialId} className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 text-xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-slate-900">{rec.materialName}</div>
                  <div className="font-mono text-slate-500 text-[11px]">{rec.materialId} • {rec.category}</div>
                </div>
                <StatusBadge status="Stock-out Risk" size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-blue-100">
                <div>
                  <span className="text-[11px] text-slate-500 block">Recommended Order:</span>
                  <span className="font-mono font-bold text-blue-900 text-sm">
                    {rec.recommendedPurchaseQty.toLocaleString()} {rec.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Earliest Replenishment:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {rec.earliestDeliveryDays ? `${rec.earliestDeliveryDays} Days` : '7 Days'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  {rec.primarySupplierName || 'Supplier B'}
                </span>
                <span className="font-medium text-slate-500">Deficit: {rec.deficit} {rec.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Material Requirements Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-sm text-slate-900">Period Material Balance Table</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-3">Item ID</th>
              <th className="py-3 px-3">Material Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Plan Required</th>
              <th className="py-3 px-3">Stock on Hand</th>
              <th className="py-3 px-3">Available</th>
              <th className="py-3 px-3">Safety Buffer</th>
              <th className="py-3 px-3">Deficit / Surplus</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requirements.map((req) => (
              <tr key={req.materialId} className={req.deficit > 0 ? 'bg-rose-50/40' : 'hover:bg-slate-50'}>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{req.materialId}</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">{req.materialName}</td>
                <td className="py-2.5 px-3 text-slate-500">{req.category}</td>
                <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                  {req.totalRequired.toLocaleString()} {req.unit}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-600">
                  {req.stockOnHand.toLocaleString()} {req.unit}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-600">
                  {req.availableStock.toLocaleString()} {req.unit}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-400">
                  {req.safetyStock.toLocaleString()} {req.unit}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold">
                  {req.deficit > 0 ? (
                    <span className="text-rose-700">-{req.deficit.toLocaleString()} {req.unit}</span>
                  ) : (
                    <span className="text-emerald-700">+{(req.availableStock - req.totalRequired).toLocaleString()} {req.unit}</span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <StatusBadge status={req.status} size="sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
