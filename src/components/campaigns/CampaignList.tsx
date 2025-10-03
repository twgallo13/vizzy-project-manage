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
          <div className="text-sm">
            <div className="font-medium">{c.name || "Untitled"}</div>
            <div className="text-xs text-muted-foreground">{new Date(c.createdAt || Date.now()).toLocaleString()}</div>
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