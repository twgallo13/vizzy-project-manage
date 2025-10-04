/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react"
import { validateAgainstGovernance, formatIssuesForUI as _formatIssuesForUI, RuleIssue as _RuleIssue, GovernanceResult } from "../../lib/rules/governance"

interface GovernancePanelProps {
  campaign: any
  onOverride?: (note: string) => void
}

export function GovernancePanel({ campaign, onOverride }: GovernancePanelProps) {
  const [overrideNote, setOverrideNote] = useState("")
  const [showOverride, setShowOverride] = useState(false)
  
  const result: GovernanceResult = validateAgainstGovernance(campaign)
  const { issues, severity } = result

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical": return "bg-red-100 text-red-800 border-red-200"
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200" 
      case "info": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleOverride = () => {
    if (overrideNote.trim() && onOverride) {
      onOverride(overrideNote.trim())
      setOverrideNote("")
      setShowOverride(false)
    }
  }

  return (
    <div className="border rounded p-3 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Governance</h3>
        <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(severity)}`}>
          {severity === "ok" ? "✓ Compliant" : `${issues.length} issue${issues.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {issues.length > 0 && (
        <div className="space-y-2 mb-3">
          {issues.map((issue, i) => (
            <div key={i} className={`text-xs p-2 rounded border ${getSeverityColor(issue.severity)}`}>
              <div className="font-medium">[{issue.code}] {issue.message}</div>
              {issue.hint && <div className="mt-1 opacity-75">{issue.hint}</div>}
            </div>
          ))}
        </div>
      )}

      {severity === "critical" && (
        <div className="mb-3">
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 mb-2">
            ⚠️ Critical issues must be resolved or overridden before saving
          </div>
          
          {!showOverride ? (
            <button
              onClick={() => setShowOverride(true)}
              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Override with Note
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                className="w-full text-xs p-2 border rounded"
                placeholder="Explain why you're overriding these critical issues..."
                value={overrideNote}
                onChange={e => setOverrideNote(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleOverride}
                  disabled={!overrideNote.trim()}
                  className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Submit Override
                </button>
                <button
                  onClick={() => setShowOverride(false)}
                  className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}