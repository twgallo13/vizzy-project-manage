export type Campaign = {
  id: string
  name: string
  objective: string
  channels: Array<"social" | "email" | "site" | "stores">
  audience: string
  startDate?: string
  endDate?: string
  assets: { type: string; spec: string }[]
  notes?: string
  createdBy: "ai" | "manual"
  createdAt: string
}