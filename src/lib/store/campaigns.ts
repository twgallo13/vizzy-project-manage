export type Id = string

function safeParse<T>(s: string | null): T | null { try { return s ? JSON.parse(s) : null } catch { return null } }

const KEY = "vizzy:camps"

export async function listCampaigns<T = any>(): Promise<T[]> {
  const arr = safeParse<T[]>(localStorage.getItem(KEY))
  return Array.isArray(arr) ? arr : []
}
export async function persistCampaign<T extends { id: Id }>(c: T): Promise<T> {
  const arr = await listCampaigns<T>()
  const idx = arr.findIndex(x => x.id === c.id)
  if (idx >= 0) arr[idx] = c; else arr.push(c)
  localStorage.setItem(KEY, JSON.stringify(arr))
  return c
}
export async function getCampaign<T = any>(id: Id): Promise<T | null> {
  const arr = await listCampaigns<T>()
  return arr.find(x => (x as any).id === id) || null
}
export async function removeCampaign(id: Id): Promise<void> {
  const arr = await listCampaigns<any>()
  localStorage.setItem(KEY, JSON.stringify(arr.filter(x => x.id !== id)))
}