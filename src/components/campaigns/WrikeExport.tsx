import React from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Download, FileText } from "lucide-react"
import { campaignToWrikeJson, wrikeTasksToCsv, downloadBlob } from "../../lib/export/wrike"

interface WrikeExportProps {
  campaign: any
}

export function WrikeExport({ campaign }: WrikeExportProps) {
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
        
        <div className="text-xs text-muted-foreground">
          <p>JSON: Complete campaign data structure</p>
          <p>CSV: Task list for spreadsheet import</p>
        </div>
      </CardContent>
    </Card>
  )
}