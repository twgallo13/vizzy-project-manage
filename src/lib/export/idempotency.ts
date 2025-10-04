/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Wrike Export Idempotency System
 * 
 * Ensures one-and-only-one Wrike project per (tenant, campaign, snapshot).
 * Subsequent identical attempts return the same project (idempotent).
 */

export interface WrikeExportRecord {
  id: string
  tenantId: string
  campaignId: string
  snapshotVersion: string
  idempotencyKey: string
  wrikeProjectId: string
  createdAt: string
  isReused?: boolean
}

export interface WrikeExportResult {
  wrikeProjectId: string
  idempotent: boolean
  idempotencyKey: string
  message?: string
}

/**
 * Generate deterministic idempotency key for a campaign export
 */
export async function generateIdempotencyKey(
  tenantId: string, 
  campaignId: string, 
  snapshotVersion: string
): Promise<string> {
  const data = `${tenantId}:${campaignId}:${snapshotVersion}`
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Get default tenant ID (for single-tenant frontend app)
 */
export function getDefaultTenantId(): string {
  return 'default-tenant'
}

/**
 * Generate snapshot version based on campaign data
 */
export function generateSnapshotVersion(campaign: any): string {
  // Create version based on key campaign fields that would affect Wrike export
  const versionData = {
    name: campaign.name,
    status: campaign.status,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    owners: campaign.owners,
    updatedAt: campaign.updatedAt || campaign.createdAt
  }
  
  return btoa(JSON.stringify(versionData)).slice(0, 12)
}