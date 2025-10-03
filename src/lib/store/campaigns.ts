import type { Campaign } from "@/lib/types/campaign"

const mem = new Map<string, Campaign>()

export async function persistCampaign(c: Campaign) { mem.set(c.id, c); return c }
export async function getCampaign(id: string) { return mem.get(id) || null }
export async function listCampaigns() { return Array.from(mem.values()) }