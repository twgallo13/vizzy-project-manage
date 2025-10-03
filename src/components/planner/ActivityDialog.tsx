import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CalendarPlus, Clock, Tag, User } from "@phosphor-icons/react"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"

export interface Activity {
  id: string
  title: string
  description?: string
  time: string
  date: string
  type: "campaign" | "content" | "meeting" | "review" | "analysis" | "social"
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high"
  assignee?: string
  tags: string[]
  estimatedDuration?: number
}

interface ActivityDialogProps {
  trigger: React.ReactNode
  activity?: Activity
  dayIndex: number
  onActivityChange: (activities: Record<string, Activity[]>) => void
  activities: Record<string, Activity[]>
}

const activityTypes = [
  { value: "campaign", label: "Campaign", color: "bg-blue-100 text-blue-800" },
  { value: "content", label: "Content", color: "bg-green-100 text-green-800" },
  { value: "meeting", label: "Meeting", color: "bg-purple-100 text-purple-800" },
  { value: "review", label: "Review", color: "bg-orange-100 text-orange-800" },
  { value: "analysis", label: "Analysis", color: "bg-pink-100 text-pink-800" },
  { value: "social", label: "Social Media", color: "bg-cyan-100 text-cyan-800" }
]

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
}

export function ActivityDialog({ trigger, activity, dayIndex, onActivityChange, activities }: ActivityDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Activity>>({
    title: activity?.title || "",
    description: activity?.description || "",
    time: activity?.time || "09:00",
    type: activity?.type || "campaign",
    status: activity?.status || "scheduled",
    priority: activity?.priority || "medium",
    assignee: activity?.assignee || "",
    tags: activity?.tags || [],
    estimatedDuration: activity?.estimatedDuration || 60
  })
  const [tagInput, setTagInput] = useState("")

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleSave = () => {
    if (!formData.title?.trim()) {
      toast.error("Please enter a title for the activity")
      return
    }

    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay() + 1)
    
    const activityDate = new Date(weekStart)
    activityDate.setDate(weekStart.getDate() + dayIndex)

    const newActivity: Activity = {
      id: activity?.id || Date.now().toString(),
      title: formData.title!,
      description: formData.description,
      time: formData.time!,
      date: activityDate.toISOString().split('T')[0],
      type: formData.type as Activity["type"],
      status: formData.status as Activity["status"],
      priority: formData.priority as Activity["priority"],
      assignee: formData.assignee,
      tags: formData.tags || [],
      estimatedDuration: formData.estimatedDuration
    }

    const dayKey = dayIndex.toString()
    const currentActivities = activities[dayKey] || []
    
    let updatedActivities
    if (activity) {
      // Update existing activity
      updatedActivities = currentActivities.map(a => a.id === activity.id ? newActivity : a)
    } else {
      // Add new activity
      updatedActivities = [...currentActivities, newActivity]
    }

    const newAllActivities = {
      ...activities,
      [dayKey]: updatedActivities
    }

    onActivityChange(newAllActivities)
    
    toast.success(activity ? "Activity updated successfully" : "Activity created successfully")
    setOpen(false)
  }

  const handleDelete = () => {
    if (!activity) return

    const dayKey = dayIndex.toString()
    const currentActivities = activities[dayKey] || []
    const updatedActivities = currentActivities.filter(a => a.id !== activity.id)
    
    const newAllActivities = {
      ...activities,
      [dayKey]: updatedActivities
    }

    onActivityChange(newAllActivities)
    toast.success("Activity deleted successfully")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5" />
            {activity ? "Edit Activity" : "New Activity"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Campaign launch meeting"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional details about this activity..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Activity["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${type.color.split(' ')[0]}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Activity["status"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Activity["priority"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="assignee"
                  value={formData.assignee}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                  placeholder="John Doe"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 60 }))}
                placeholder="60"
                min="15"
                step="15"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add a tag..."
                  className="pl-10"
                />
              </div>
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {activity && (
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Activity
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {activity ? "Update Activity" : "Create Activity"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}