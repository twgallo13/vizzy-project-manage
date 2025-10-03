export function toLocalHM(ts: unknown): string {
  const d = ts instanceof Date ? ts : new Date(String(ts))
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function nowISO(): string {
  return new Date().toISOString()
}