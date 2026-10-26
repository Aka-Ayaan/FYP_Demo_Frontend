import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import { X, Sliders, Zap, RotateCcw, AlertTriangle } from 'lucide-react'

interface DemoControlsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DemoControlsModal: React.FC<DemoControlsModalProps> = ({ isOpen, onClose }) => {
  const {
    forceNextRunInfeasible,
    setForceNextRunInfeasible,
    demoSpeed,
    setDemoSpeed,
    jumpToState,
    resetDemoData,
    plans,
    scenarios,
    datasetVersion,
  } = useAppStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900">Presenter Demo Controls</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Simulation Speed */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Simulation Delay Speed
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoSpeed('normal')}
                className={`py-2 px-3 text-sm font-medium rounded-lg border text-center transition-all ${
                  demoSpeed === 'normal'
                    ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold ring-1 ring-blue-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Normal (3–5s delays)
              </button>
              <button
                type="button"
                onClick={() => setDemoSpeed('fast')}
                className={`py-2 px-3 text-sm font-medium rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                  demoSpeed === 'fast'
                    ? 'bg-amber-50 border-amber-600 text-amber-700 font-semibold ring-1 ring-amber-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                Fast (Snappy demo)
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Scales optimization, scenario, and upload animations.
            </p>
          </div>

          {/* Infeasibility Injector */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Force Next Run Infeasible
                  </div>
                  <div className="text-xs text-slate-500">
                    Next optimization will produce binding constraint diagnostics.
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={forceNextRunInfeasible}
                onChange={(e) => setForceNextRunInfeasible(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Quick Jump States */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Jump to Seeded State
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  jumpToState('waiting_approval')
                  onClose()
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm font-medium text-slate-800 flex items-center justify-between"
              >
                <span>Plan Waiting for Approval</span>
                <span className="text-xs text-slate-400">Prod. Manager role</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  jumpToState('infeasible_scenario')
                  onClose()
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-sm font-medium text-slate-800 flex items-center justify-between"
              >
                <span>Infeasible Scenario Diagnostics</span>
                <span className="text-xs text-slate-400">SCN-03 (+40% Demand)</span>
              </button>
            </div>
          </div>

          {/* Current State Info */}
          <div className="text-xs text-slate-500 bg-slate-100 p-3 rounded-lg space-y-1">
            <div className="flex justify-between">
              <span>Active dataset:</span>
              <span className="font-semibold text-slate-700">{datasetVersion}</span>
            </div>
            <div className="flex justify-between">
              <span>Plans count:</span>
              <span className="font-semibold text-slate-700">{plans.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Scenarios count:</span>
              <span className="font-semibold text-slate-700">{scenarios.length}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              resetDemoData()
              onClose()
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 py-1.5 px-3 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Demo Data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
