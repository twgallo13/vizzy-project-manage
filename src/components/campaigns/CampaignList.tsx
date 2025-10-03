import React, { useEffect, useState } from "react"
import { listCampaigns, removeCampaign } from "../../lib/store/campaigns"

type Campaign = {
  id: string
  name?: string
  createdAt?: string
  objective?: string
  status?: "Draft" | "Planned" | "Live" | "Archived"
  tags?: string[]
}

export default function CampaignList({ onOpen }: { onOpen: (id: string) => void }) {
  const [items, setItems] = useState<Campaign[]>([])
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"All" | Campaign["status"]>("All")

  const refresh = async () => {
    const arr = await listCampaigns<Campaign>()
    setItems(Array.isArray(arr) ? arr : [])
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filtered = items.filter(c => {
    const matchesStatus = status === "All" ? true : c.status === status
    const hay = (c.name || "") + " " + (c.objective || "") + " " + (c.tags || []).join(" ")
    const matchesText = hay.toLowerCase().includes(q.toLowerCase())
    return matchesStatus && matchesText
  })

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          className="w-full rounded border p-2 text-sm"
          placeholder="Search name, objective, tags"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select
          className="rounded border p-2 text-sm"
          value={status}
          onChange={e => setStatus(e.target.value as any)}
        >
          <option>All</option>
          <option>Draft</option>
          <option>Planned</option>
          <option>Live</option>
          <option>Archived</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-sm text-muted-foreground">No campaigns yet.</div>
      )}

      {filtered.map(c => (
        <div key={c.id} className="flex items-center justify-between rounded border p-2">
          <div className="text-sm">
            <div className="font-medium">{c.name || "Untitled"}</div>
            <div className="text-xs text-muted-foreground">
              {(c.createdAt && new Date(c.createdAt).toLocaleString()) || ""}
              {c.status ? ` • ${c.status}` : ""}
              {c.tags && c.tags.length ? ` • ${c.tags.join(", ")}` : ""}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="text-xs underline" onClick={() => onOpen(c.id)}>Open</button>
            <button
              className="text-xs text-red-600 underline"
              onClick={async () => {
                await removeCampaign(c.id)
                void refresh()
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}