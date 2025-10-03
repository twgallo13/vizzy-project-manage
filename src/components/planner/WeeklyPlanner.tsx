import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CaretLeft, CaretRight, Plus, Clock, User } from "@phosphor-icons/react"
import { useKV } from "../../hooks/useKV"
import { ActivityDialog, Activity } from "./ActivityDialog"

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const getMockActivities = (): Record<string, Activity[]> => {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)
  
  return {
    "0": [
      { 
        id: "1", 
        title: "Campaign Review", 
        time: "10:00", 
        date: new Date(weekStart.getTime()).toISOString().split('T')[0],
        type: "review", 
        status: "scheduled",
        priority: "medium",
        tags: ["quarterly", "performance"],
        assignee: "Sarah Miller",
        estimatedDuration: 90
      },
      { 
        id: "2", 
        title: "Social Media Posts", 
        time: "14:00", 
        date: new Date(weekStart.getTime()).toISOString().split('T')[0],
        type: "content", 
        status: "in-progress",
        priority: "high",
        tags: ["social", "content"],
        assignee: "Mike Johnson",
        estimatedDuration: 120
      }
    ],
    "2": [
      { 
        id: "3", 
        title: "Team Standup", 
        time: "09:00", 
        date: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: "meeting", 
        status: "completed",
        priority: "medium",
        tags: ["daily", "team"],
        assignee: "All Team",
        estimatedDuration: 30
      },
      { 
        id: "4", 
        title: "Launch Summer Campaign", 
        time: "11:00", 
        date: new Date(weekStart.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: "campaign", 
        status: "scheduled",
        priority: "high",
        tags: ["launch", "summer", "campaign"],
        assignee: "Marketing Team",
        estimatedDuration: 180
      }
    ],
    "4": [
      { 
        id: "5", 
        title: "Performance Analysis", 
        time: "15:00", 
        date: new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        type: "analysis", 
        status: "scheduled",
        priority: "medium",
        tags: ["analysis", "kpi", "weekly"],
        assignee: "Data Team",
        estimatedDuration: 120
      }
    ]
  }
}

export function WeeklyPlanner() {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [activities, setActivities] = useKV<Record<string, Activity[]>>("weekly-activities", getMockActivities())

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
      case "analysis": return "bg-pink-100 text-pink-800"
      case "social": return "bg-cyan-100 text-cyan-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: Activity["priority"]) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-gray-100 text-gray-800"
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
                  <ActivityDialog
                    trigger={
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    }
                    dayIndex={index}
                    activities={activities || {}}
                    onActivityChange={setActivities}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayActivities.map((activity) => (
                  <ActivityDialog
                    key={activity.id}
                    trigger={
                      <div 
                        className="p-2 rounded-md bg-muted/50 text-xs space-y-1 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="font-medium">{activity.title}</div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                          {activity.estimatedDuration && (
                            <span>({activity.estimatedDuration}min)</span>
                          )}
                        </div>
                        {activity.assignee && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="w-3 h-3" />
                            {activity.assignee}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          <Badge 
                            variant="secondary" 
                            className={`${getTypeColor(activity.type)} text-xs`}
                          >
                            {activity.type}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(activity.status)} text-xs`}
                          >
                            {activity.status}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`${getPriorityColor(activity.priority)} text-xs`}
                          >
                            {activity.priority}
                          </Badge>
                        </div>
                        {activity.tags && activity.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {activity.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {activity.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{activity.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    }
                    activity={activity}
                    dayIndex={index}
                    activities={activities || {}}
                    onActivityChange={setActivities}
                  />
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
            <CardTitle className="flex items-center justify-between">
              <span>{weekDays[selectedDay]} Activities</span>
              <ActivityDialog
                trigger={
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Activity
                  </Button>
                }
                dayIndex={selectedDay}
                activities={activities || {}}
                onActivityChange={setActivities}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(activities?.[selectedDay.toString()] || []).map((activity) => (
                <ActivityDialog
                  key={activity.id}
                  trigger={
                    <div className="p-4 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.description}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.time} ({activity.estimatedDuration}min)
                            </div>
                            {activity.assignee && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {activity.assignee}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="secondary" className={getTypeColor(activity.type)}>
                              {activity.type}
                            </Badge>
                            <Badge variant="secondary" className={getStatusColor(activity.status)}>
                              {activity.status}
                            </Badge>
                            <Badge variant="secondary" className={getPriorityColor(activity.priority)}>
                              {activity.priority}
                            </Badge>
                            {activity.tags && activity.tags.map(tag => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  activity={activity}
                  dayIndex={selectedDay}
                  activities={activities || {}}
                  onActivityChange={setActivities}
                />
              ))}
              {(activities?.[selectedDay.toString()] || []).length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="space-y-2">
                    <div>No activities scheduled for {weekDays[selectedDay]}</div>
                    <ActivityDialog
                      trigger={
                        <Button variant="outline" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add First Activity
                        </Button>
                      }
                      dayIndex={selectedDay}
                      activities={activities || {}}
                      onActivityChange={setActivities}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}