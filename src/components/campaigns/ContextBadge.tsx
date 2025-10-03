import React from "react"
import { Badge } from "../ui/badge"
import { activeTriggers } from "../../lib/context/triggers"

interface ContextBadgeProps {
  campaign: {
    startDate?: string
    endDate?: string
  }
}

export function ContextBadge({ campaign }: ContextBadgeProps) {
  const triggers = activeTriggers(campaign)
  
  if (triggers.length === 0) {
    return null
  }
  
  return (
    <div className="flex gap-1 flex-wrap">
      {triggers.map(trigger => (
        <Badge 
          key={trigger.id} 
          variant="secondary" 
          className="text-xs bg-orange-100 text-orange-800 hover:bg-orange-200"
        >
          {trigger.label}
        </Badge>
      ))}
    </div>
  )
}