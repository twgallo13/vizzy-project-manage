import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CaretLeft, CaretRight, Plus } from "@phosphor-icons/react"
import { useKV } from "@github/spark/hooks"

interface Activity {
  id: string
  title: string
  time: string
  type: "campaign" | "content" | "meeting" | "review"
  status: "scheduled" | "in-progress" | "completed"
}

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const mockActivities: Record<string, Activity[]> = {
  "0": [
    { id: "1", title: "Campaign Review", time: "10:00 AM", type: "review", status: "scheduled" },
    { id: "2", title: "Social Media Posts", time: "2:00 PM", type: "content", status: "in-progress" }
  ],
  "2": [
    { id: "3", title: "Team Standup", time: "9:00 AM", type: "meeting", status: "completed" },
    { id: "4", title: "Launch Summer Campaign", time: "11:00 AM", type: "campaign", status: "scheduled" }
  ],
  "4": [
    { id: "5", title: "Performance Analysis", time: "3:00 PM", type: "review", status: "scheduled" }
  ]
}

export function WeeklyPlanner() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [activities] = useKV<Record<string, Activity[]>>("weekly-activities", mockActivities)

  const getWeekDateRange = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7))
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return {
      start: startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      end: endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const getTypeColor = (type: Activity["type"]) => {
    switch (type) {
      case "campaign": return "bg-blue-100 text-blue-800"
      case "content": return "bg-green-100 text-green-800"
      case "meeting": return "bg-purple-100 text-purple-800"
      case "review": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-yellow-100 text-yellow-800"
      case "scheduled": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const weekRange = getWeekDateRange()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Weekly Planner</h2>
          <p className="text-muted-foreground">
            {weekRange.start} - {weekRange.end}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentWeek(prev => prev - 1)}
          >
            <CaretLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentWeek(0)}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentWeek(prev => prev + 1)}
          >
            <CaretRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayActivities = activities?.[index.toString()] || []
          const isSelected = selectedDay === index
          
          return (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedDay(isSelected ? null : index)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {day}
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Plus className="w-3 h-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="p-2 rounded-md bg-muted/50 text-xs space-y-1"
                  >
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-muted-foreground">{activity.time}</div>
                    <div className="flex gap-1">
                      <Badge 
                        variant="secondary" 
                        className={getTypeColor(activity.type)}
                      >
                        {activity.type}
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(activity.status)}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {dayActivities.length === 0 && (
                  <div className="text-muted-foreground text-xs p-2 text-center">
                    No activities
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedDay !== null && (
        <Card>
          <CardHeader>
            <CardTitle>{weekDays[selectedDay]} Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-8">
              Detailed day view and activity management will be implemented here
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}