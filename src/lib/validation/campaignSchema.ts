import { z } from "zod"
export const CampaignAssetSchema = z.object({
  type: z.string().min(1),
  spec: z.string().min(1)
})
export const CampaignOwnersSchema = z.object({
  creative: z.string().optional(),
  social: z.string().optional(),
  stores: z.string().optional(),
  approvals: z.string().optional()
})
export const CampaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  objective: z.string().default("") ,
  channels: z.array(z.enum(["social","email","site","stores"])).default([]),
  audience: z.string().default("") ,
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  assets: z.array(CampaignAssetSchema).default([]),
  notes: z.string().optional(),
  status: z.enum(["Draft","Planned","Live","Archived"]).optional(),
  tags: z.array(z.string()).optional(),
  createdBy: z.enum(["ai","manual"]).optional(),
  createdAt: z.string().optional(),
  owners: CampaignOwnersSchema.optional()
})
export type TCampaign = z.infer<typeof CampaignSchema>
