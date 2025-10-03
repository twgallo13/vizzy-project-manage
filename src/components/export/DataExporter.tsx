import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Download, FileText, Table, Database, Calendar } from "@phosphor-icons/react"
import { useKV } from "../../hooks/useKV"
import { toast } from "sonner"

interface ExportConfig {
  format: "xlsx" | "csv" | "json" | "pdf"
  dateRange: {
    from: Date
    to: Date
  }
  dataTypes: string[]
  includeCharts: boolean
  includeMetadata: boolean
}

interface ExportHistory {
  id: string
  filename: string
  format: string
  createdAt: string
  status: "completed" | "processing" | "failed"
  size: string
}

const exportFormats = [
  { value: "xlsx", label: "Excel (.xlsx)", description: "Best for Wrike integration", icon: Table },
  { value: "csv", label: "CSV", description: "Universal data format", icon: Database },
  { value: "json", label: "JSON", description: "For API integration", icon: FileText },
  { value: "pdf", label: "PDF Report", description: "Executive summary", icon: FileText }
]

const dataTypes = [
  { id: "campaigns", label: "Campaign Data", description: "Performance metrics and details" },
  { id: "analytics", label: "Analytics", description: "Traffic and engagement data" },
  { id: "activities", label: "Activities", description: "Planned and completed activities" },
  { id: "users", label: "User Data", description: "Team member information" },
  { id: "kpis", label: "KPI Metrics", description: "Key performance indicators" }
]

export function DataExporter({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportHistory, setExportHistory] = useKV<ExportHistory[]>("export-history", [])
  
  const [config, setConfig] = useState<ExportConfig>({
    format: "xlsx",
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date()
    },
    dataTypes: ["campaigns", "analytics"],
    includeCharts: true,
    includeMetadata: true
  })

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const steps = [
        "Collecting data...",
        "Processing analytics...",
        "Generating charts...",
        "Formatting output...",
        "Finalizing export..."
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setExportProgress((i + 1) * 20)
        toast.loading(steps[i], { id: "export-progress" })
      }

      // Generate filename
      const formatDate = (date: Date) => date.toISOString().split('T')[0]
      const filename = `vizzy-export-${formatDate(config.dateRange.from)}-to-${formatDate(config.dateRange.to)}.${config.format}`

      // Add to history
      const exportRecord: ExportHistory = {
        id: Date.now().toString(),
        filename,
        format: config.format,
        createdAt: new Date().toISOString(),
        status: "completed",
        size: `${Math.floor(Math.random() * 5 + 1)}.${Math.floor(Math.random() * 10)}MB`
      }

      setExportHistory(prev => [exportRecord, ...(prev || []).slice(0, 9)]) // Keep last 10

      toast.success("Export completed successfully!", { id: "export-progress" })
      
      // Simulate file download
      const blob = new Blob([JSON.stringify({ message: "Sample export data", config }, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      toast.error("Export failed. Please try again.", { id: "export-progress" })
    } finally {
      setIsExporting(false)
      setExportProgress(0)
      setOpen(false)
    }
  }

  const toggleDataType = (typeId: string) => {
    setConfig(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(typeId)
        ? prev.dataTypes.filter(id => id !== typeId)
        : [...prev.dataTypes, typeId]
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon
                return (
                  <Card 
                    key={format.value}
                    className={`cursor-pointer transition-all ${
                      config.format === format.value ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setConfig(prev => ({ ...prev, format: format.value as ExportConfig["format"] }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <div className="font-medium">{format.label}</div>
                          <div className="text-sm text-muted-foreground">{format.description}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Date Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="from-date" className="text-sm">From</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={config.dateRange.from.toISOString().split('T')[0]}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: new Date(e.target.value) }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date" className="text-sm">To</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={config.dateRange.to.toISOString().split('T')[0]}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: new Date(e.target.value) }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Data Types */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Data to Include</Label>
            <div className="space-y-3">
              {dataTypes.map((type) => (
                <div key={type.id} className="flex items-start gap-3">
                  <Checkbox
                    id={type.id}
                    checked={config.dataTypes.includes(type.id)}
                    onCheckedChange={() => toggleDataType(type.id)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={type.id} className="font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      {type.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Additional Options</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="include-charts"
                  checked={config.includeCharts}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeCharts: !!checked }))}
                />
                <Label htmlFor="include-charts" className="cursor-pointer">
                  Include charts and visualizations
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="include-metadata"
                  checked={config.includeMetadata}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeMetadata: !!checked }))}
                />
                <Label htmlFor="include-metadata" className="cursor-pointer">
                  Include metadata and export info
                </Label>
              </div>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Export Progress</Label>
              <Progress value={exportProgress} className="w-full" />
              <div className="text-sm text-muted-foreground text-center">
                {exportProgress}% complete
              </div>
            </div>
          )}

          {/* Export History */}
          {exportHistory && exportHistory.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Recent Exports</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {exportHistory.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div className="text-sm">
                        <div className="font-medium">{record.filename}</div>
                        <div className="text-muted-foreground">
                          {new Date(record.createdAt).toLocaleDateString()} • {record.size}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || config.dataTypes.length === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? "Exporting..." : "Start Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}