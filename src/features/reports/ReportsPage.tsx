import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { simulate } from '@/store/simulate'
import {
  FileText,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Boxes,
  DollarSign,
} from 'lucide-react'

interface ReportCard {
  id: string
  title: string
  category: string
  description: string
  icon: React.ElementType
}

const REPORT_TYPES: ReportCard[] = [
  {
    id: 'rep-plan',
    title: 'Production Schedule & Shift Dispatch',
    category: 'Planning',
    description: '4-week daily batch allocations by line and machine with changeover timings.',
    icon: Calendar,
  },
  {
    id: 'rep-mat',
    title: 'Material Requirements & Shortage Report',
    category: 'Procurement',
    description: 'BOM explosion deficit calculations with supplier lead time recommendations.',
    icon: Layers,
  },
  {
    id: 'rep-inv',
    title: 'Physical Stock Position Audit',
    category: 'Inventory',
    description: 'Current warehouse stock on hand, reserved quantities, and safety stock variances.',
    icon: Boxes,
  },
  {
    id: 'rep-cost',
    title: 'Financial Variance & Cost Breakdown',
    category: 'Finance',
    description: '10-component cost comparison vs baseline plan with per-unit allocations.',
    icon: DollarSign,
  },
]

interface GeneratedReport {
  id: string
  name: string
  format: 'PDF' | 'Excel (CSV)'
  timestamp: string
  size: string
}

export const ReportsPage: React.FC = () => {
  const { plans, materials, logAction } = useAppStore()
  const [generatingReportId, setGeneratingReportId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [reportHistory, setReportHistory] = useState<GeneratedReport[]>([
    { id: 'gen-01', name: 'Q4 Production Schedule Dispatch', format: 'PDF', timestamp: '2026-10-24 14:30', size: '1.4 MB' },
    { id: 'gen-02', name: 'Raw Material Shortage Risk Log', format: 'Excel (CSV)', timestamp: '2026-10-23 11:15', size: '420 KB' },
  ])

  const handleGenerate = async (report: ReportCard, format: 'PDF' | 'Excel') => {
    const reportKey = `${report.id}-${format}`
    setGeneratingReportId(reportKey)

    await simulate(1000)

    // If Excel, generate a real client-side CSV download!
    if (format === 'Excel') {
      let csvContent = 'data:text/csv;charset=utf-8,'
      if (report.id === 'rep-inv' || report.id === 'rep-mat') {
        csvContent += 'Material ID,Name,Category,Stock On Hand,Safety Stock,Unit\n'
        materials.forEach((m) => {
          csvContent += `"${m.id}","${m.name}","${m.category}",${m.stockOnHand},${m.safetyStock},"${m.unit}"\n`
        })
      } else {
        csvContent += 'Allocation ID,Line,SKU,Date,Quantity,Shift Hours\n'
        const plan = plans[0]
        plan.allocations.slice(0, 30).forEach((a) => {
          csvContent += `"${a.id}","${a.lineId}","${a.sku}","${a.date}",${a.quantity},${a.shiftHours}\n`
        })
      }

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    setReportHistory((prev) => [
      {
        id: `gen-0${prev.length + 1}`,
        name: report.title,
        format: format === 'Excel' ? 'Excel (CSV)' : 'PDF',
        timestamp: '2026-10-24 16:50',
        size: format === 'Excel' ? '340 KB' : '1.8 MB',
      },
      ...prev,
    ])
    setGeneratingReportId(null)
    setToastMessage(`Report generated: ${report.title} (${format})`)
    logAction('Generate Report', report.title, format, undefined, 'Exported client-side report')

    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-8 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operational Documentation</div>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5">Automated Report Generation Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Export production schedules, bill of materials shortage logs, and financial variance summaries to PDF and Excel CSV.
        </p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_TYPES.map((rep) => {
          const Icon = rep.icon
          const isPdfGen = generatingReportId === `${rep.id}-PDF`
          const isXlsGen = generatingReportId === `${rep.id}-Excel`

          return (
            <div
              key={rep.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {rep.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{rep.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{rep.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  disabled={isPdfGen}
                  onClick={() => handleGenerate(rep, 'PDF')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>{isPdfGen ? 'Generating...' : 'Export PDF'}</span>
                </button>
                <button
                  type="button"
                  disabled={isXlsGen}
                  onClick={() => handleGenerate(rep, 'Excel')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isXlsGen ? 'Exporting...' : 'Export Excel (CSV)'}</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Generated Reports History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Recently Generated Reports History</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {reportHistory.map((gen) => (
            <div key={gen.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {gen.format.includes('PDF') ? (
                  <FileText className="w-4 h-4 text-rose-500" />
                ) : (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                )}
                <div>
                  <div className="font-semibold text-slate-800">{gen.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Format: {gen.format} • Size: {gen.size}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span>{gen.timestamp}</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
