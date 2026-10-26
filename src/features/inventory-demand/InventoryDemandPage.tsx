import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { StatusBadge } from '@/components/StatusBadge'
import { PRODUCTS } from '@/mock/data'
import { simulate } from '@/store/simulate'
import {
  Boxes,
  Play,
  CheckCircle,
  Sparkles,
  BarChart3,
} from 'lucide-react'

interface ForecastModelMetric {
  modelName: string
  modelType: 'Statistical' | 'Machine Learning'
  mape: number
  wape: number
  bias: number
  isBest: boolean
}

const FORECAST_MODELS: ForecastModelMetric[] = [
  { modelName: '3-Month Moving Average', modelType: 'Statistical', mape: 12.4, wape: 10.8, bias: -1.2, isBest: false },
  { modelName: 'Holt-Winters Exp Smoothing', modelType: 'Statistical', mape: 9.1, wape: 8.2, bias: +0.4, isBest: false },
  { modelName: 'LightGBM Gradient Booster', modelType: 'Machine Learning', mape: 6.8, wape: 5.9, bias: +0.1, isBest: true },
]

export const InventoryDemandPage: React.FC = () => {
  const { currentRole, materials, logAction } = useAppStore()
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'demand'>(
    currentRole === 'inventory' ? 'inventory' : 'demand'
  )

  const [selectedProductSku, setSelectedProductSku] = useState('AC-150-INV')
  const [isForecasting, setIsForecasting] = useState(false)

  const handleRunForecast = async () => {
    setIsForecasting(true)
    await simulate(2000)
    setIsForecasting(false)
    logAction(
      'Run Forecast Engine',
      `Demand Model (${selectedProductSku})`,
      'WAPE 5.9% (LightGBM)',
      'Baseline Holt-Winters',
      'Seasonal demand forecast comparison evaluated'
    )
  }

  const selectedProduct = PRODUCTS.find((p) => p.sku === selectedProductSku) || PRODUCTS[4]

  // 4 weekly demand buckets
  const weeklyDemandData = [
    { week: 'Week 45 (Nov 2)', forecast: selectedProduct.targetWeeklyDemand, confirmed: Math.round(selectedProduct.targetWeeklyDemand * 0.92) },
    { week: 'Week 46 (Nov 9)', forecast: Math.round(selectedProduct.targetWeeklyDemand * 1.05), confirmed: Math.round(selectedProduct.targetWeeklyDemand * 0.88) },
    { week: 'Week 47 (Nov 16)', forecast: Math.round(selectedProduct.targetWeeklyDemand * 1.10), confirmed: Math.round(selectedProduct.targetWeeklyDemand * 0.75) },
    { week: 'Week 48 (Nov 23)', forecast: Math.round(selectedProduct.targetWeeklyDemand * 1.15), confirmed: Math.round(selectedProduct.targetWeeklyDemand * 0.65) },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operations Planning</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Inventory Positions & Demand Forecast</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-echelon stock levels, weekly order pipelines, and predictive demand analytics.</p>
        </div>

        {/* Subtabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('inventory')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'inventory' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventory Positions ({materials.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('demand')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSubTab === 'demand' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demand & Forecasting
          </button>
        </div>
      </div>

      {/* VIEW 1: Inventory Positions */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-600" />
              Raw Material & Component Positions
            </h3>
            <span className="text-xs text-slate-400">Inventory role actionable view</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-3">Item ID</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Stock On Hand</th>
                  <th className="py-3 px-3">Reserved</th>
                  <th className="py-3 px-3">Available</th>
                  <th className="py-3 px-3">Safety Stock</th>
                  <th className="py-3 px-3">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m) => {
                  const available = m.stockOnHand - m.reservedStock
                  const isShort = m.stockOnHand <= m.safetyStock
                  const isExcess = m.stockOnHand > m.safetyStock * 4

                  return (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{m.id}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{m.name}</td>
                      <td className="py-2.5 px-3 text-slate-500">{m.category}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                        {m.stockOnHand.toLocaleString()} {m.unit}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {m.reservedStock.toLocaleString()} {m.unit}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-blue-700">
                        {available.toLocaleString()} {m.unit}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {m.safetyStock.toLocaleString()} {m.unit}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge
                          status={isShort ? 'Stock-out Risk' : isExcess ? 'Near Limit' : 'Adequate'}
                          size="sm"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Demand & Forecasting */}
      {activeSubTab === 'demand' && (
        <div className="space-y-6">
          {/* Top Product Selector & Run Forecast Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-500">Select Appliance SKU:</label>
              <select
                value={selectedProductSku}
                onChange={(e) => setSelectedProductSku(e.target.value)}
                className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {PRODUCTS.map((p) => (
                  <option key={p.sku} value={p.sku}>
                    {p.sku} — {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleRunForecast}
              disabled={isForecasting}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {isForecasting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Models (2s)...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Forecast Engine</span>
                </>
              )}
            </button>
          </div>

          {/* Model Comparison Table (Section 6.4) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Forecasting Model Performance Evaluation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ML is used only if it beats the statistical baseline (WAPE threshold test).
                </p>
              </div>
              <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full font-semibold">
                Best: LightGBM Gradient Booster
              </span>
            </div>

            <table className="w-full text-left text-xs mb-3">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Algorithm / Architecture</th>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">MAPE</th>
                  <th className="py-2.5 px-4">WAPE</th>
                  <th className="py-2.5 px-4">Forecast Bias</th>
                  <th className="py-2.5 px-4">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FORECAST_MODELS.map((model) => (
                  <tr
                    key={model.modelName}
                    className={model.isBest ? 'bg-purple-50/40 font-semibold text-slate-900' : 'hover:bg-slate-50 text-slate-700'}
                  >
                    <td className="py-2.5 px-4 flex items-center gap-2">
                      {model.isBest && <CheckCircle className="w-4 h-4 text-purple-600" />}
                      <span>{model.modelName}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500">{model.modelType}</td>
                    <td className="py-2.5 px-4 font-mono">{model.mape}%</td>
                    <td className="py-2.5 px-4 font-mono">{model.wape}%</td>
                    <td className="py-2.5 px-4 font-mono">{model.bias > 0 ? `+${model.bias}%` : `${model.bias}%`}</td>
                    <td className="py-2.5 px-4">
                      {model.isBest ? (
                        <span className="text-xs font-bold text-purple-700">Selected (Best Fit)</span>
                      ) : (
                        <span className="text-slate-400">Baseline</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              Note: LightGBM incorporates ambient seasonal temperature indexes and distributor pre-order patterns, beating Holt-Winters by 2.3% WAPE.
            </div>
          </div>

          {/* Forecast vs Confirmed Orders Weekly Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Forecast vs Confirmed Orders — {selectedProduct.name} ({selectedProduct.sku})
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Bars show confirmed dealer orders alongside projected demand with confidence band.
            </p>

            <div className="space-y-5">
              {weeklyDemandData.map((d) => {
                const maxVal = 700
                const forecastWidth = (d.forecast / maxVal) * 100
                const confirmedWidth = (d.confirmed / maxVal) * 100

                return (
                  <div key={d.week} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{d.week}</span>
                      <span className="font-mono text-slate-500">
                        Confirmed: <strong className="text-blue-700">{d.confirmed}</strong> | Forecast: <strong className="text-purple-700">{d.forecast}</strong> units
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Confirmed orders bar */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${confirmedWidth}%` }}
                          title={`Confirmed Orders: ${d.confirmed}`}
                        />
                      </div>
                      {/* ML Forecast projection bar */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500/80 rounded-full transition-all duration-300"
                          style={{ width: `${forecastWidth}%` }}
                          title={`Predicted Demand: ${d.forecast}`}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span>Confirmed Dealer Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <span>ML Ensembled Forecast Target</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
