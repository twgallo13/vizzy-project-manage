import { useEffect, useState } from "react"
import { listCampaigns, removeCampaign } from "@/lib/store/campaigns"

export default function CampaignList({ onOpen }: { onOpen: (id: string) => void }) {
  const [items, setItems] = useState<any[]>([])
  const refresh = async () => setItems(await listCampaigns())
  useEffect(() => { void refresh() }, [])

  return (
    <div className="space-y-2">
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