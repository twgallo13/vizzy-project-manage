import { useEffect, useState, useRef } from "react"
import { listCampaigns, persistCampaign, removeCampaign } from "@/lib/store/campaigns"

export default function CampaignList({ onOpen }: { onOpen: (id: string) => void }) {
  const [items, setItems] = useState<any[]>([])
  const [filters, setFilters] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("vizzy:listFilters") || "{}")
    } catch { return {} }
  })
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const refresh = async () => setItems(await listCampaigns())
  useEffect(() => { void refresh() }, [])
  useEffect(() => { localStorage.setItem("vizzy:listFilters", JSON.stringify(filters)) }, [filters])

  const handleExport = async () => {
    const campaigns = await listCampaigns()
    const blob = new Blob([JSON.stringify(campaigns, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "campaigns.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      const text = await file.text()
      const importedCampaigns = JSON.parse(text)
      
      if (Array.isArray(importedCampaigns)) {
        // Merge campaigns by persisting each one
        for (const campaign of importedCampaigns) {
          if (campaign.id && campaign.name) {
            await persistCampaign(campaign)
          }
        }
        void refresh()
        alert(`Imported ${importedCampaigns.length} campaigns`)
      } else {
        alert("Invalid JSON format: expected array of campaigns")
      }
    } catch (error) {
      alert("Failed to import campaigns: " + (error instanceof Error ? error.message : "Unknown error"))
    }
    
    // Reset file input
    if (event.target) event.target.value = ""
  }

  const handleCopyJSON = async (campaign: any) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(campaign, null, 2))
      setCopiedId(campaign.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error("Failed to copy JSON:", err)
    }
  }

  // Filtering logic
  const filteredItems = items.filter(c => {
    const statusOk = !filters.status || filters.status === "All" || c.status === filters.status
    const text = (filters.text || "").toLowerCase()
    const textOk = !text || [c.name, c.objective, ...(c.tags||[])].join(" ").toLowerCase().includes(text)
    return statusOk && textOk
  })
  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      <div className="flex gap-2 items-center pb-2 border-b">
        <select
          className="text-xs rounded border px-2 py-1 bg-gray-50"
          value={filters.status || "All"}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="All">All</option>
          <option value="Draft">Draft</option>
          <option value="Planned">Planned</option>
          <option value="Live">Live</option>
          <option value="Archived">Archived</option>
        </select>
        <input
          type="text"
          className="text-xs rounded border px-2 py-1 bg-gray-50"
          placeholder="Search name, objective, tags"
          value={filters.text || ""}
          onChange={e => setFilters(f => ({ ...f, text: e.target.value }))}
          style={{ minWidth: 120 }}
        />
        <button 
          onClick={handleExport}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Export
        </button>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
        >
          Import
        </button>
      </div>
      {filteredItems.length === 0 && <div className="text-sm text-muted-foreground">No campaigns found.</div>}
      {filteredItems.map(c => (
        <div key={c.id} className="flex items-center justify-between rounded border p-2">
          <div className="text-sm flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium">{c.name || "Untitled"}</div>
              {c.status && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{c.status}</span>}
              {(() => {
                if (c.startDate && c.endDate) {
                  const start = new Date(c.startDate)
                  const end = new Date(c.endDate)
                  const diffMs = end.getTime() - start.getTime()
                  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                  return <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{diffDays} days</span>
                } else if (c.startDate) {
                  const start = new Date(c.startDate)
                  const now = new Date()
                  const diffMs = start.getTime() - now.getTime()
                  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                  if (diffDays > 0) {
                    return <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">starts in {diffDays}</span>
                  } else if (diffDays === 0) {
                    return <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">starts today</span>
                  } else {
                    return <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">started {Math.abs(diffDays)} ago</span>
                  }
                }
                return null
              })()}
            </div>
            <div className="text-xs text-muted-foreground">{new Date(c.createdAt || Date.now()).toLocaleString()}</div>
            {c.tags && c.tags.length > 0 && <div className="text-xs text-muted-foreground mt-1">{c.tags.join(", ")}</div>}
          </div>
          <div className="flex gap-2 items-center">
            <button className="text-xs underline" onClick={() => onOpen(c.id)}>Open</button>
            <button 
              className="text-xs underline text-blue-600" 
              onClick={() => handleCopyJSON(c)}
            >
              {copiedId === c.id ? "Copied!" : "Copy JSON"}
            </button>
            <button className="text-xs text-red-600 underline" onClick={async () => { await removeCampaign(c.id); void refresh() }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}