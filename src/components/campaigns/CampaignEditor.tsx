import { useEffect, useState } from "react"
import { getCampaign, persistCampaign } from "@/lib/store/campaigns"

export default function CampaignEditor({ id, onClose }: { id: string; onClose?: ()=>void }) {
  const [c, setC] = useState<any | null>(null)
  useEffect(() => { (async ()=>setC(await getCampaign(id)))() }, [id])
  if (!c) return <div className="text-sm text-muted-foreground">Loading…</div>
  return (
    <div className="space-y-2">
      <input className="w-full rounded border p-2" value={c.name || ""} onChange={e=>setC({ ...c, name:e.target.value })} placeholder="Campaign name" />
      <textarea className="w-full rounded border p-2" value={c.objective || ""} onChange={e=>setC({ ...c, objective:e.target.value })} placeholder="Objective" />
      <input className="w-full rounded border p-2" value={(c.channels||[]).join(", ")} onChange={e=>setC({ ...c, channels:e.target.value.split(",").map((x:string)=>x.trim()).filter(Boolean) })} placeholder="channels (comma separated)" />
      <div className="flex gap-2">
        <button className="rounded bg-primary px-3 py-1 text-primary-foreground" onClick={async()=>{ await persistCampaign(c); alert("Saved") }}>Save</button>
        {onClose && <button className="rounded border px-3 py-1" onClick={onClose}>Close</button>}
      </div>
    </div>
  )
}