import { useEffect, useState, useRef } from "react"
import { listCampaigns, removeCampaign, persistCampaign } from "@/lib/store/campaigns"

export default function CampaignList({ onOpen }: { onOpen: (id: string) => void }) {
  const [items, setItems] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const refresh = async () => setItems(await listCampaigns())
  useEffect(() => { void refresh() }, [])

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

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        style={{ display: 'none' }}
      />
      {items.length > 0 && (
        <div className="pb-2 border-b flex gap-2">
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
      )}
      {items.length === 0 && <div className="text-sm text-muted-foreground">No campaigns yet.</div>}
      {items.map(c => (
        <div key={c.id} className="flex items-center justify-between rounded border p-2">
          <div className="text-sm flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium">{c.name || "Untitled"}</div>
              {c.status && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{c.status}</span>}
            </div>
            <div className="text-xs text-muted-foreground">{new Date(c.createdAt || Date.now()).toLocaleString()}</div>
            {c.tags && c.tags.length > 0 && <div className="text-xs text-muted-foreground mt-1">{c.tags.join(", ")}</div>}
          </div>
          <div className="flex gap-2">
            <button className="text-xs underline" onClick={() => onOpen(c.id)}>Open</button>
            <button className="text-xs text-red-600 underline" onClick={async () => { await removeCampaign(c.id); void refresh() }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}