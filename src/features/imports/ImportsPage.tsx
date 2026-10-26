import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { simulate } from '@/store/simulate'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Clock,
} from 'lucide-react'

interface StagedRow {
  rowNum: number
  sku: string
  name: string
  quantity: number
  unit: string
  status: 'valid' | 'warning' | 'error'
  issue?: string
}

const INITIAL_STAGED_DATA: StagedRow[] = [
  { rowNum: 1, sku: 'RM-101', name: 'Cold Rolled Steel Sheet 0.7mm', quantity: 12000, unit: 'kg', status: 'valid' },
  { rowNum: 2, sku: 'RM-102', name: 'Seamless Copper Tubing 3/8"', quantity: 6000, unit: 'meters', status: 'valid' },
  { rowNum: 3, sku: 'RM-999', name: 'Unknown Experimental Coil', quantity: 500, unit: 'kg', status: 'error', issue: 'Unknown SKU not in Master Database' },
  { rowNum: 4, sku: 'RM-201', name: 'Polyol Blend (Rigid Foam)', quantity: 4500, unit: 'liters', status: 'valid' },
  { rowNum: 5, sku: 'RM-202', name: 'Polymeric MDI Isocyanate', quantity: -350, unit: 'liters', status: 'error', issue: 'Negative quantity not allowed (-350)' },
  { rowNum: 6, sku: 'RM-301', name: 'Variable Inverter Compressor', quantity: 400, unit: '', status: 'warning', issue: 'Missing unit of measure, defaulted to pcs' },
  { rowNum: 7, sku: 'RM-304', name: 'Smart Inverter Main PCB Board', quantity: 1200, unit: 'pcs', status: 'valid' },
]

export const ImportsPage: React.FC = () => {
  const { currentRole, datasetVersion, datasetVersions, commitSpreadsheetImport } = useAppStore()

  const [activeTab, setActiveTab] = useState<'inventory' | 'master'>(
    currentRole === 'admin' ? 'master' : 'inventory'
  )
  const [stagedFile, setStagedFile] = useState<string | null>('Weekly_Inventory_Count_W45.xlsx')
  const [isStaging, setIsStaging] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [skipInvalid, setSkipInvalid] = useState(false)
  const [stagedRows, setStagedRows] = useState<StagedRow[]>(INITIAL_STAGED_DATA)
  const [commitSuccess, setCommitSuccess] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setStagedFile(file.name)
    setIsStaging(true)
    setCommitSuccess(false)
    await simulate(800)
    setStagedRows(INITIAL_STAGED_DATA)
    setIsStaging(false)
  }

  const validCount = stagedRows.filter((r) => r.status === 'valid').length
  const warningCount = stagedRows.filter((r) => r.status === 'warning').length
  const errorCount = stagedRows.filter((r) => r.status === 'error').length

  const handleCommit = async () => {
    if (!stagedFile || isCommitting) return
    setIsCommitting(true)
    const commitCount = skipInvalid ? validCount + warningCount : validCount
    await commitSpreadsheetImport(stagedFile, commitCount)
    setIsCommitting(false)
    setCommitSuccess(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Ingestion</div>
          <h1 className="text-xl font-bold text-slate-900 mt-0.5">Spreadsheet & Master Data Imports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active committed dataset: <span className="font-mono font-bold text-slate-800">{datasetVersion}</span>
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventory Spreadsheets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('master')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'master'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Master Data
          </button>
        </div>
      </div>

      {/* Disabled SAP Integration Card */}
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5 flex items-center justify-between opacity-80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
              SAP ERP Direct Connector
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                Planned — Phase 2 Integration
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated API synchronization with Dawlance SAP S/4HANA material ledger will replace manual spreadsheet uploads.
            </p>
          </div>
        </div>
        <button
          disabled
          className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-200/60 rounded-lg cursor-not-allowed"
        >
          Disabled in Prototype
        </button>
      </div>

      {/* Main Import Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Drag & Drop Upload Zone */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-semibold text-sm text-slate-900 mb-2">Upload File</h3>
            <p className="text-xs text-slate-500 mb-4">
              Upload .xlsx or .csv physical stock spreadsheets. Files are staged in memory.
            </p>

            <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20">
              <Upload className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Click to select or drag and drop</span>
              <span className="text-[11px] text-slate-400 mt-1">Accepts any test spreadsheet file</span>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
            </label>

            {stagedFile && (
              <div className="mt-4 p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-800">{stagedFile}</span>
                </div>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {isStaging ? 'Staging...' : 'Staged'}
                </span>
              </div>
            )}
          </div>

          {/* Import History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="font-semibold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Dataset Commit History
            </h3>
            <div className="space-y-3">
              {datasetVersions.map((ver) => (
                <div key={ver.version} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900 font-mono">{ver.version}</span>
                    <span className="text-[10px] text-slate-400">{ver.committedAt}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">{ver.changesDescription}</div>
                  <div className="text-slate-400 text-[10px] mt-1 font-medium">{ver.committedBy} • {ver.rowCount} rows</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Staging & Row-level Validation Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Staging Validation Table</h3>
                <p className="text-xs text-slate-500">Row-level schema and master-data constraint verification</p>
              </div>

              {/* Summary Counts */}
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {validCount} Valid
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {warningCount} Warnings
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                  <XCircle className="w-3.5 h-3.5" />
                  {errorCount} Errors
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3">Material Name</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stagedRows.map((row) => (
                    <tr
                      key={row.rowNum}
                      className={
                        row.status === 'error'
                          ? 'bg-rose-50/40 text-rose-900'
                          : row.status === 'warning'
                          ? 'bg-amber-50/40 text-amber-900'
                          : 'hover:bg-slate-50'
                      }
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400">{row.rowNum}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold">{row.sku}</td>
                      <td className="py-2.5 px-3">{row.name}</td>
                      <td className="py-2.5 px-3 font-mono font-medium">{row.quantity}</td>
                      <td className="py-2.5 px-3 text-slate-500">{row.unit || '—'}</td>
                      <td className="py-2.5 px-3">
                        {row.status === 'valid' && (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                          </span>
                        )}
                        {row.status === 'warning' && (
                          <span className="text-amber-700 font-medium flex items-center gap-1" title={row.issue}>
                            <AlertTriangle className="w-3.5 h-3.5" /> {row.issue}
                          </span>
                        )}
                        {row.status === 'error' && (
                          <span className="text-rose-700 font-semibold flex items-center gap-1" title={row.issue}>
                            <XCircle className="w-3.5 h-3.5" /> {row.issue}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Commit Actions Strip */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipInvalid}
                  onChange={(e) => setSkipInvalid(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Skip invalid rows ({errorCount} rows) and proceed with valid batches</span>
              </label>

              <button
                type="button"
                onClick={handleCommit}
                disabled={isCommitting || (!skipInvalid && errorCount > 0)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-2"
              >
                {isCommitting ? (
                  <span>Committing Dataset...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Commit & Apply Dataset</span>
                  </>
                )}
              </button>
            </div>

            {/* Commit Success Banner */}
            {commitSuccess && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Dataset Successfully Committed as {datasetVersion}!
                  </div>
                  <div className="text-emerald-700 mt-0.5">
                    Stock count updated for RM-102 Seamless Copper Tubing (+6,000 meters). Shortage alert cleared.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
