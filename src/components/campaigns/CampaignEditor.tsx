import { useEffect, useState } from "react"
import { getCampaign, persistCampaign } from "@/lib/store/campaigns"
import { CampaignSchema } from "@/lib/validation/campaignSchema"
import { COMMON_ASSETS, ensureAssetUniq } from "@/lib/assets/specs"

export default function CampaignEditor({ id, onClose }: { id: string; onClose?: ()=>void }) {
  const [c, setC] = useState<any | null>(null)
  const [error, setError] = useState<string>("")
  const [showAssets, setShowAssets] = useState(false)
  useEffect(() => { (async ()=>setC(await getCampaign(id)))() }, [id])
  if (!c) return <div className="text-sm text-muted-foreground">Loading…</div>
  const defaultOwners = {
    creative: "Abby",
    social: "Vanezza",
    stores: "Antonio",
    approvals: "Theo"
  }
  return (
    <div className="space-y-2">
      <div className="border rounded p-2 bg-muted/30">
        <div className="text-xs font-semibold mb-1">Owners</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(defaultOwners).map(([role, def]) => (
            <div key={role} className="flex flex-col gap-1">
              <label className="text-xs capitalize">{role}</label>
              <input
                className="rounded border p-1 text-xs"
                value={c.owners?.[role] ?? def}
                onChange={e => setC({
                  ...c,
                  owners: { ...c.owners, [role]: e.target.value }
                })}
                placeholder={def}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <button className="text-xs underline text-primary" type="button" onClick={()=>setShowAssets(v=>!v)}>
          Add common assets
        </button>
        {showAssets && (
          <div className="flex gap-1 flex-wrap">
            {COMMON_ASSETS.map((a, i) => (
              <button
                key={a.type + a.spec}
                className="border rounded px-2 py-1 text-xs bg-muted hover:bg-primary/10"
                type="button"
                onClick={()=>{
                  setC(prev => ({
                    ...prev,
                    assets: ensureAssetUniq([...(prev.assets||[]), a])
                  }))
                }}
              >{a.type}</button>
            ))}
          </div>
        )}
      </div>
      <input className="w-full rounded border p-2" value={c.name || ""} onChange={e=>setC({ ...c, name:e.target.value })} placeholder="Campaign name" />
      <textarea className="w-full rounded border p-2" value={c.objective || ""} onChange={e=>setC({ ...c, objective:e.target.value })} placeholder="Objective" />
      <input className="w-full rounded border p-2" value={(c.channels||[]).join(", ")} onChange={e=>setC({ ...c, channels:e.target.value.split(",").map((x:string)=>x.trim()).filter(Boolean) })} placeholder="channels (comma separated)" />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs">Start Date</label>
          <input
            type="date"
            className="rounded border p-2"
            value={c.startDate || ""}
            onChange={e => setC({ ...c, startDate: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs">End Date</label>
          <input
            type="date"
            className="rounded border p-2"
            value={c.endDate || ""}
            onChange={e => setC({ ...c, endDate: e.target.value })}
          />
        </div>
      </div>
      <select className="w-full rounded border p-2" value={c.status || "Draft"} onChange={e=>setC({ ...c, status:e.target.value })}>
        <option value="Draft">Draft</option>
        <option value="Planned">Planned</option>
        <option value="Live">Live</option>
        <option value="Archived">Archived</option>
      </select>
      <input className="w-full rounded border p-2" value={(c.tags||[]).join(", ")} onChange={e=>setC({ ...c, tags:[...new Set(e.target.value.split(",").map((x:string)=>x.trim()).filter(Boolean))] })} placeholder="tags (comma separated)" />
      <textarea className="w-full rounded border p-2" value={(c.assets||[]).map((a:any)=>`${a.type}: ${a.spec}`).join("\n")} onChange={e=>setC({ ...c, assets:e.target.value.split("\n").map((line:string)=>{
        const [type, ...specArr] = line.split(":")
        return type && specArr.length ? { type: type.trim(), spec: specArr.join(":").trim() } : null
      }).filter(Boolean) })} placeholder="assets (one per line, format: type: spec)" />
      {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}
      <div className="flex gap-2">
        <button className="rounded bg-primary px-3 py-1 text-primary-foreground" onClick={async()=>{
          try {
            CampaignSchema.parse(c)
            await persistCampaign(c)
            setError("")
            alert("Saved")
          } catch (e: any) {
            setError(e.message || "Validation failed")
          }
        }}>Save</button>
        {onClose && <button className="rounded border px-3 py-1" onClick={onClose}>Close</button>}
      </div>
    </div>
  )
}