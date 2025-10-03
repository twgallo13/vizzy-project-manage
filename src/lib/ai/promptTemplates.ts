export const STAFF_RULES = `
Owners:
- Creative: Abby
- Social: Vanezza
- Stores & Events: Antonio
- Approvals: Theo
Store-first: every campaign should reference store regions & in-store impact.
`

export function buildCampaignPrompt(brief: string, constraints: any) {
  return `
You are a marketing planner for Shiekh. Follow STAFF_RULES and respond with ONLY valid JSON:
{name, objective, channels, audience, startDate, endDate, assets:[{type,spec}], notes}

STAFF_RULES:
${STAFF_RULES}

Brief:
${brief}

Constraints:
${JSON.stringify(constraints)}
`.trim()
}