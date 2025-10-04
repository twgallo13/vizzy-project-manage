/* eslint-disable @typescript-eslint/no-explicit-any */
import { activeTriggers } from '../context/triggers'

export const STAFF_RULES = `
Owners:
- Creative: Abby
- Social: Vanezza
- Stores & Events: Antonio
- Approvals: Theo
Set owners accordingly: Creative=Abby, Social=Vanezza, Stores=Antonio, Approvals=Theo.
Store-first: every campaign should reference store regions & in-store impact.
`

export const GOVERNANCE_RULES = `
CRITICAL GOVERNANCE REQUIREMENTS:
1. OWNER VALIDATION: Must assign correct owner (Creative=Abby, Social=Vanezza, Stores=Antonio, Approvals=Theo)
2. CHANNEL RESTRICTIONS: Social campaigns limited to [instagram, tiktok, twitter, youtube]
3. DATE VALIDATION: Start date must be after today, end after start, max 90 days duration
4. STORE-FIRST MANDATE: ALL campaigns require store region targeting and in-store impact plan
5. STATUS TRANSITIONS: Only allow draft→review→approved→active→completed progression

ESCALATION REQUIRED: Any governance override needs business justification and approval chain.
These rules are NON-NEGOTIABLE without proper escalation process.
`

export function buildCampaignPrompt(brief: string, constraints: any, campaignStartDate?: string, campaignEndDate?: string) {
  const contextInfo = getActiveContextInfo(campaignStartDate, campaignEndDate)
  
  return `
You are a marketing planner for Shiekh. Follow STAFF_RULES and GOVERNANCE_RULES. Respond with ONLY valid JSON:
{name, objective, channels, audience, startDate, endDate, assets:[{type,spec}], notes}

STAFF_RULES:
${STAFF_RULES}

GOVERNANCE_RULES:
${GOVERNANCE_RULES}

${contextInfo ? `CONTEXTUAL AWARENESS:
${contextInfo}
Consider this context when planning campaigns - leverage relevant sports/cultural moments for maximum impact.
` : ''}

Brief:
${brief}

Constraints:
${JSON.stringify(constraints)}

IMPORTANT: Ensure all generated campaigns comply with governance rules to avoid blocking issues.
`.trim()
}

function getActiveContextInfo(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return ''
  
  const campaign = { startDate, endDate }
  const triggers = activeTriggers(campaign)
  
  if (triggers.length === 0) return ''
  
  return `Active contexts for this campaign period:
${triggers.map(t => `• ${t.label}: ${t.note || 'Consider timing and relevance'}`).join('\n')}
`
}