import React, { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { Download, FileText, ExternalLink, Check, Clock } from "lucide-react"
import { campaignToWrikeJson, wrikeTasksToCsv, downloadBlob, createWrikeProject } from "../../lib/export/wrike"
import { useRecomputeStatus } from "../../lib/recompute/status"
import { toast } from "sonner"

interface WrikeExportProps {
  campaign: any
}

export function WrikeExport({ campaign }: WrikeExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [lastExportResult, setLastExportResult] = useState<{
    projectId: string
    idempotent: boolean
    message: string
  } | null>(null)
  const recomputeStatus = useRecomputeStatus()

  const handleJsonExport = () => {
    const obj = campaignToWrikeJson(campaign)
    const filename = `${campaign.name || "campaign"}.wrike.json`
    const content = JSON.stringify(obj, null, 2)
    downloadBlob(filename, content, "application/json")
  }

  const handleCsvExport = () => {
    const obj = campaignToWrikeJson(campaign)
    const csv = wrikeTasksToCsv(obj.tasks)
    const filename = `${campaign.name || "campaign"}-tasks.csv`
    downloadBlob(filename, csv, "text/csv")
  }

  const handleWrikeProjectExport = async () => {
    if (!campaign.id) {
      toast.error("Campaign must be saved before exporting to Wrike")
      return
    }

    if (recomputeStatus.isRunning) {
      toast.warning("Weekly recompute in progress. Export will be queued until complete.")
      return
    }

    setIsExporting(true)
    try {
      const result = await createWrikeProject(campaign)
      setLastExportResult({
        projectId: result.wrikeProjectId,
        idempotent: result.idempotent,
        message: result.message || ''
      })
      
      if (result.idempotent) {
        toast.success(`Reusing existing Wrike project: ${result.wrikeProjectId}`)
      } else {
        toast.success(`Created new Wrike project: ${result.wrikeProjectId}`)
      }
    } catch (error) {
      console.error('Wrike export failed:', error)
      toast.error('Failed to export to Wrike. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Wrike Export
        </CardTitle>
        <CardDescription>
          Export campaign data for manual import into Wrike
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recomputeStatus.isRunning && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Weekly recompute in progress</p>
                <p className="text-sm text-muted-foreground">
                  {recomputeStatus.message} ({recomputeStatus.progress || 0}%)
                </p>
                <p className="text-xs text-orange-600">
                  Wrike export blocked to prevent duplicates
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleWrikeProjectExport}
          disabled={isExporting || recomputeStatus.isRunning}
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          {isExporting ? "Creating Wrike Project..." : "Create Wrike Project"}
        </Button>

        {lastExportResult && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">
                  Project ID: {lastExportResult.projectId}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lastExportResult.message}
                </p>
                {lastExportResult.idempotent && (
                  <p className="text-xs text-orange-600">
                    ✓ Idempotent - reused existing export
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="border-t pt-3 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Manual Export Files:</p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleJsonExport}
            className="w-full justify-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Wrike JSON
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCsvExport}
            className="w-full justify-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export Wrike CSV (tasks)
          </Button>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>JSON: Complete campaign data structure</p>
            <p>CSV: Task list for spreadsheet import</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}