/* eslint-disable @typescript-eslint/no-explicit-any */
import { CampaignSchema } from "../validation/campaignSchema"
export async function createCampaignWithAI(brief: string, constraints: any = {}) {
  try {
    const res = await fetch("/api/campaigns/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brief,
        constraints: {
          storeFirst: true,
          owners: { creative: "Abby", social: "Vanezza", stores: "Antonio" },
          assetsRequired: ["IG Reel", "Poster 1080x1350", "Email Banner 1200x600"],
          ...constraints
        }
      })
    })

    // Handle network errors or API not found (development mode)
    if (!res.ok && res.status === 404) {
      throw new Error("API endpoint not available in development mode")
    }

    const data = await res.json()
    if (!data.ok) throw new Error(data.error || "Failed to create campaign")
  let parsed = data.campaign
  // Validate and coerce defaults
  let validated = CampaignSchema.parse(parsed)
  if (!validated.id) validated.id = String(Date.now())
  if (!validated.createdBy) validated.createdBy = "ai"
  if (!validated.createdAt) validated.createdAt = new Date().toISOString()
  return validated
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Cannot connect to API server")
    }
    throw error
  }
}