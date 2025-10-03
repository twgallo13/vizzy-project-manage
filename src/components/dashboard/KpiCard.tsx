import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  trend: string
  icon: React.ComponentType<{ className?: string }>
  color?: string
}

export function KpiCard({ title, value, trend, icon: Icon, color = "text-blue-600" }: KpiCardProps) {
  const isPositive = trend.startsWith("+")
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("w-4 h-4", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={cn(
          "text-xs",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          {trend} from last week
        </p>
      </CardContent>
    </Card>
  )
}