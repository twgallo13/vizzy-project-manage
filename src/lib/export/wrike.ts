import { 
  generateIdempotencyKey, 
  generateSnapshotVersion, 
  getDefaultTenantId, 
  WrikeExportResult 
} from './idempotency'
import { 
  findExportByKey, 
  createExportRecord 
} from './persistence'

export function campaignToWrikeJson(c: any) {
  return {
    campaign: {
      id: c.id, 
      name: c.name, 
      status: c.status, 
      tags: c.tags || [],
      owners: c.owners || {}, 
      schedule: { startDate: c.startDate, endDate: c.endDate },
      targeting: c.targeting || {}, 
      assets: c.assets || [], 
      notes: c.notes || ""
    },
    tasks: [
      { title: "Creative Brief", owner: c.owners?.creative || "Abby", due: c.startDate },
      { title: "Social Plan", owner: c.owners?.social || "Vanezza", due: c.startDate },
      { title: "Stores Coordination", owner: c.owners?.stores || "Antonio", due: c.startDate },
      { title: "Approvals", owner: c.owners?.approvals || "Theo", due: c.startDate }
    ]
  }
}

/**
 * Idempotent Wrike project creation
 * Returns existing project ID if already exported, creates new one otherwise
 */
export async function createWrikeProject(campaign: any): Promise<WrikeExportResult> {
  const tenantId = getDefaultTenantId()
  const campaignId = campaign.id
  const snapshotVersion = generateSnapshotVersion(campaign)
  const idempotencyKey = await generateIdempotencyKey(tenantId, campaignId, snapshotVersion)
  
  // Check if export already exists
  const existingExport = findExportByKey(idempotencyKey)
  if (existingExport) {
    return {
      wrikeProjectId: existingExport.wrikeProjectId,
      idempotent: true,
      idempotencyKey,
      message: `That export already exists (idempotency). Reusing ${existingExport.wrikeProjectId}.`
    }
  }
  
  // Simulate Wrike API call - in reality this would call Wrike's API
  const wrikeProjectId = `WRIKE_${Date.now()}_${Math.random().toString(36).slice(2).toUpperCase()}`
  
  try {
    // Persist the export record
    createExportRecord(tenantId, campaignId, snapshotVersion, idempotencyKey, wrikeProjectId)
    
    return {
      wrikeProjectId,
      idempotent: false,
      idempotencyKey,
      message: `Created new Wrike project: ${wrikeProjectId}`
    }
  } catch (error) {
    // Handle race condition - someone else created the same export
    if (error instanceof Error && error.message.includes('already exists')) {
      const raceExport = findExportByKey(idempotencyKey)
      if (raceExport) {
        return {
          wrikeProjectId: raceExport.wrikeProjectId,
          idempotent: true,
          idempotencyKey,
          message: `That export already exists (race condition). Reusing ${raceExport.wrikeProjectId}.`
        }
      }
    }
    throw error
  }
}

export function wrikeTasksToCsv(tasks: {title:string;owner:string;due?:string}[]) {
  const head = "title,owner,due"
  const rows = tasks.map(t => [t.title, t.owner, t.due || ""].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))
  return [head, ...rows].join("\n")
}

export function downloadBlob(filename: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}