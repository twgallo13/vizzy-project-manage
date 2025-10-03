export interface RuleIssue {
  severity: "info" | "warning" | "critical"
  code: string
  message: string
  hint?: string
  path?: string
}

export interface GovernanceResult {
  issues: RuleIssue[]
  severity: "ok" | "warning" | "critical"
  complianceScore: number
  lastValidated: string
  hasBlockingIssues: boolean
}

export function validateAgainstGovernance(campaign: any): GovernanceResult {
  const issues: RuleIssue[] = []

  // Rule: Required owners
  const requiredOwners = {
    creative: "Abby",
    social: "Vanezza", 
    stores: "Antonio",
    approvals: "Theo"
  }

  for (const [role, expectedName] of Object.entries(requiredOwners)) {
    const actualName = campaign.owners?.[role]
    if (!actualName || actualName !== expectedName) {
      issues.push({
        severity: "critical",
        code: "OWNER_MISMATCH",
        message: `${role} owner must be ${expectedName}`,
        hint: `Set owners.${role} to "${expectedName}"`,
        path: `owners.${role}`
      })
    }
  }

  // Rule: Channels allowlist
  const allowedChannels = ["social", "email", "site", "stores"]
  const channels = campaign.channels || []
  for (const channel of channels) {
    if (!allowedChannels.includes(channel)) {
      issues.push({
        severity: "warning",
        code: "INVALID_CHANNEL",
        message: `Channel "${channel}" is not in allowlist`,
        hint: `Use only: ${allowedChannels.join(", ")}`,
        path: "channels"
      })
    }
  }

  // Rule: Date validation
  if (campaign.startDate && campaign.endDate) {
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)
    if (start > end) {
      issues.push({
        severity: "critical",
        code: "DATE_INVALID",
        message: "Start date must be before end date",
        hint: "Check your date inputs",
        path: "startDate,endDate"
      })
    }
  }

  // Rule: Store-first reminder
  if (channels.includes("stores") && (!campaign.audience || !campaign.audience.toLowerCase().includes("store"))) {
    issues.push({
      severity: "warning",
      code: "STORE_TARGETING",
      message: "Store channel selected but no store targeting mentioned",
      hint: "Add store regions or targeting details to audience field",
      path: "audience"
    })
  }

  // Rule: Status transitions
  if (campaign.status === "Planned" && !campaign.overrideApproved) {
    issues.push({
      severity: "warning", 
      code: "STATUS_APPROVAL",
      message: "Planned status requires approval or override",
      hint: "Get approval before setting to Planned",
      path: "status"
    })
  }

  // Rule: Store-first mandate
  const hasStoreChannel = channels.includes("stores")
  const hasStoreTargeting = campaign.targeting?.storeIds?.length > 0 || campaign.targeting?.regions?.length > 0
  if (hasStoreChannel && !hasStoreTargeting) {
    issues.push({
      severity: "warning",
      code: "MISSING_STORE_TARGETING", 
      message: "Store channel requires store/region targeting",
      hint: "Add store targeting in the Stores & Events section",
      path: "targeting"
    })
  }

  // Determine overall severity
  const hasCritical = issues.some(i => i.severity === "critical")
  const hasWarning = issues.some(i => i.severity === "warning")
  
  const severity = hasCritical ? "critical" : hasWarning ? "warning" : "ok"
  
  // Calculate compliance score
  const complianceScore = calculateComplianceScore(issues)

  return { 
    issues, 
    severity,
    complianceScore,
    lastValidated: new Date().toISOString(),
    hasBlockingIssues: hasCritical
  }
}

function calculateComplianceScore(issues: RuleIssue[]): number {
  if (issues.length === 0) return 100
  
  const weights = { critical: 30, warning: 10, info: 5 }
  const totalDeductions = issues.reduce((sum, issue) => sum + weights[issue.severity], 0)
  
  return Math.max(0, 100 - totalDeductions)
}

export function formatIssuesForUI(issues: RuleIssue[]): string {
  if (issues.length === 0) return "No issues found"
  
  return issues.map(issue => 
    `[${issue.severity.toUpperCase()}] ${issue.message}${issue.hint ? ` - ${issue.hint}` : ''}`
  ).join('\n')
}