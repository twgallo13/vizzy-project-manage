export type Trigger = { 
  id: string
  label: string
  start: string
  end: string
  note?: string 
}

export const DEFAULT_TRIGGERS: Trigger[] = [
  { id: "dodgers", label: "Dodgers Postseason", start: "2025-09-20", end: "2025-10-31" },
  { id: "lakers", label: "Lakers Opening", start: "2025-10-01", end: "2026-04-15" },
  { id: "thanksgiving", label: "Thanksgiving", start: "2025-11-20", end: "2025-11-28" }
]

export function activeTriggers(on: {startDate?: string; endDate?: string}, ref = new Date()) {
  const s = on.startDate ? new Date(on.startDate) : ref
  const e = on.endDate ? new Date(on.endDate) : ref
  return DEFAULT_TRIGGERS.filter(t => new Date(t.end) >= s && new Date(t.start) <= e)
}