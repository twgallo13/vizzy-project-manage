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

export const GovernanceOverrideSchema = z.object({
  ruleId: z.string(),
  overrideReason: z.string(),
  approvedBy: z.string(),
  approvedAt: z.string(),
  escalationLevel: z.enum(["manager", "director", "vp"])
})

export const GovernanceTrackingSchema = z.object({
  overrides: z.array(GovernanceOverrideSchema).default([]),
  lastValidated: z.string().optional(),
  complianceScore: z.number().min(0).max(100).optional(),
  escalationFlags: z.array(z.string()).default([])
})

export const CampaignTargetingSchema = z.object({
  storeIds: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  eventType: z.enum(["community", "customer", "partner"]).optional()
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
  status: z.enum(["draft","review","approved","active","completed","archived"]).optional(),
  tags: z.array(z.string()).optional(),
  createdBy: z.enum(["ai","manual"]).optional(),
  createdAt: z.string().optional(),
  owners: CampaignOwnersSchema.optional(),
  governance: GovernanceTrackingSchema.optional(),
  targeting: CampaignTargetingSchema.optional()
})
export type TCampaign = z.infer<typeof CampaignSchema>
export type TGovernanceOverride = z.infer<typeof GovernanceOverrideSchema>
export type TGovernanceTracking = z.infer<typeof GovernanceTrackingSchema>
export type TCampaignTargeting = z.infer<typeof CampaignTargetingSchema>
