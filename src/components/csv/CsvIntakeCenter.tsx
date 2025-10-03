import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, CheckCircle, Warning, Download, MapPin } from "@phosphor-icons/react"
import { useKV } from "../../hooks/useKV"
import { toast } from "sonner"

interface CsvMapping {
  sourceColumn: string
  targetField: string
  dataType: string
  isRequired: boolean
}

interface ImportJob {
  id: string
  filename: string
  status: "uploading" | "mapping" | "processing" | "completed" | "error"
  progress: number
  rowCount?: number
  errorCount?: number
  createdAt: Date
}

const supportedSources = [
  {
    id: "ga4",
    name: "Google Analytics 4",
    description: "Website traffic and conversion data",
    expectedColumns: ["Date", "Sessions", "Users", "Page Views", "Bounce Rate", "Conversions"]
  },
  {
    id: "meta",
    name: "Meta Business",
    description: "Facebook and Instagram campaign performance",
    expectedColumns: ["Date", "Campaign Name", "Impressions", "Clicks", "Spend", "Conversions"]
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Search and display campaign metrics",
    expectedColumns: ["Date", "Campaign", "Ad Group", "Impressions", "Clicks", "Cost", "Conversions"]
  },
  {
    id: "hootsuite",
    name: "Hootsuite",
    description: "Social media engagement and reach",
    expectedColumns: ["Date", "Platform", "Posts", "Reach", "Engagement", "Clicks"]
  },
  {
    id: "mailchimp",
    name: "Email Marketing",
    description: "Email campaign performance",
    expectedColumns: ["Date", "Campaign", "Sent", "Opens", "Clicks", "Unsubscribes"]
  },
  {
    id: "products",
    name: "Product Feed",
    description: "Product catalog and inventory data",
    expectedColumns: ["SKU", "Name", "Category", "Price", "Stock", "Sales"]
  }
]

export function CsvIntakeCenter() {
  const [activeTab, setActiveTab] = useState("upload")
  const [selectedSource, setSelectedSource] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentJob, setCurrentJob] = useState<ImportJob | null>(null)
  const [importJobs, setImportJobs] = useKV<ImportJob[]>("csv-import-jobs", [])
  const [mappings, setMappings] = useState<CsvMapping[]>([])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file")
      return
    }

    const job: ImportJob = {
      id: Date.now().toString(),
      filename: file.name,
      status: "uploading",
      progress: 0,
      createdAt: new Date()
    }

    setCurrentJob(job)
    setImportJobs(prev => [...(prev || []), job])
    
    // Simulate file upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          setCurrentJob(prev => prev ? { ...prev, status: "mapping", progress: 100 } : null)
          setActiveTab("mapping")
          simulateColumnDetection(file)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const simulateColumnDetection = (file: File) => {
    // Simulate reading CSV headers
    setTimeout(() => {
      const source = supportedSources.find(s => s.id === selectedSource)
      if (source) {
        const mockMappings: CsvMapping[] = source.expectedColumns.map((col, index) => ({
          sourceColumn: `Column_${index + 1}`,
          targetField: col.toLowerCase().replace(/\s+/g, '_'),
          dataType: col.includes('Date') ? 'date' : 
                   col.includes('Rate') || col.includes('Count') || col.includes('Cost') ? 'number' : 'text',
          isRequired: index < 3
        }))
        setMappings(mockMappings)
      }
      
      setCurrentJob(prev => prev ? { 
        ...prev, 
        status: "mapping",
        rowCount: Math.floor(Math.random() * 10000) + 1000
      } : null)
    }, 1000)
  }

  const processImport = () => {
    if (!currentJob) return

    setCurrentJob(prev => prev ? { ...prev, status: "processing", progress: 0 } : null)
    
    // Simulate data processing
    const processInterval = setInterval(() => {
      setCurrentJob(prev => {
        if (!prev) return null
        
        const newProgress = prev.progress + 5
        if (newProgress >= 100) {
          clearInterval(processInterval)
          const completedJob = {
            ...prev,
            status: "completed" as const,
            progress: 100,
            errorCount: Math.floor(Math.random() * 10)
          }
          
          setImportJobs(prevJobs => 
            (prevJobs || []).map(job => 
              job.id === prev.id ? completedJob : job
            )
          )
          
          toast.success(`Import completed! ${completedJob.rowCount} rows processed with ${completedJob.errorCount} errors.`)
          setActiveTab("history")
          return completedJob
        }
        
        return { ...prev, progress: newProgress }
      })
    }, 300)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">CSV Intake Center</h2>
        <p className="text-muted-foreground">Import and map your marketing data from various sources</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="mapping" disabled={!currentJob || currentJob.status === "uploading"}>
            Mapping
          </TabsTrigger>
          <TabsTrigger value="process" disabled={!currentJob || currentJob.status !== "mapping"}>
            Process
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload CSV File
              </CardTitle>
              <CardDescription>
                Select your data source and upload a CSV file for processing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="data-source">Data Source</Label>
                <Select value={selectedSource} onValueChange={setSelectedSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data source..." />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        <div className="flex flex-col items-start">
                          <div className="font-medium">{source.name}</div>
                          <div className="text-xs text-muted-foreground">{source.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSource && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Expected Columns</CardTitle>
                    <CardDescription>
                      Your CSV should contain the following columns for optimal mapping
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {supportedSources
                        .find(s => s.id === selectedSource)
                        ?.expectedColumns.map((column) => (
                          <Badge key={column} variant="outline">
                            {column}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="csv-file">CSV File</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">CSV files only, up to 10MB</p>
                  </div>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={!selectedSource}
                  />
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => document.getElementById('csv-file')?.click()}
                    disabled={!selectedSource}
                  >
                    Choose File
                  </Button>
                </div>
              </div>

              {currentJob?.status === "uploading" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading {currentJob.filename}...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Column Mapping
              </CardTitle>
              <CardDescription>
                Map your CSV columns to the appropriate data fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentJob && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Processing file: <strong>{currentJob.filename}</strong> ({currentJob.rowCount} rows detected)
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {mappings.map((mapping, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label className="text-xs text-muted-foreground">Source Column</Label>
                      <div className="font-medium">{mapping.sourceColumn}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Target Field</Label>
                      <Select value={mapping.targetField} onValueChange={(value) => {
                        const newMappings = [...mappings]
                        newMappings[index].targetField = value
                        setMappings(newMappings)
                      }}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="campaign_name">Campaign Name</SelectItem>
                          <SelectItem value="impressions">Impressions</SelectItem>
                          <SelectItem value="clicks">Clicks</SelectItem>
                          <SelectItem value="spend">Spend</SelectItem>
                          <SelectItem value="conversions">Conversions</SelectItem>
                          <SelectItem value="ignore">Ignore Column</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Data Type</Label>
                      <Select value={mapping.dataType} onValueChange={(value) => {
                        const newMappings = [...mappings]
                        newMappings[index].dataType = value
                        setMappings(newMappings)
                      }}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="currency">Currency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      {mapping.isRequired && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveTab("upload")}>
                  Back
                </Button>
                <Button onClick={() => setActiveTab("process")}>
                  Confirm Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="process" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Process Data
              </CardTitle>
              <CardDescription>
                Review your mapping and start the data import process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentJob?.status === "processing" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Processing data...</span>
                    <span>{currentJob.progress}%</span>
                  </div>
                  <Progress value={currentJob.progress} />
                  <p className="text-xs text-muted-foreground">
                    This may take a few moments depending on file size
                  </p>
                </div>
              )}

              {currentJob?.status === "mapping" && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Process</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your mapping is complete. Click the button below to start importing your data.
                  </p>
                  <Button onClick={processImport} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Start Import
                  </Button>
                </div>
              )}

              {currentJob?.status === "completed" && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Import Complete!</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Successfully processed {currentJob.rowCount} rows with {currentJob.errorCount} errors.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("history")}>
                      View History
                    </Button>
                    <Button onClick={() => {
                      setCurrentJob(null)
                      setActiveTab("upload")
                      setSelectedSource("")
                      setMappings([])
                    }}>
                      Import More Data
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Import History
              </CardTitle>
              <CardDescription>
                View your previous data imports and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(importJobs || []).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        job.status === "completed" ? "bg-green-100 text-green-600" :
                        job.status === "error" ? "bg-red-100 text-red-600" :
                        "bg-yellow-100 text-yellow-600"
                      }`}>
                        {job.status === "completed" ? <CheckCircle className="w-5 h-5" /> :
                         job.status === "error" ? <Warning className="w-5 h-5" /> :
                         <Upload className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium">{job.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          {job.createdAt.toLocaleDateString()} at {job.createdAt.toLocaleTimeString()}
                          {job.rowCount && ` • ${job.rowCount} rows`}
                          {job.errorCount && job.errorCount > 0 && ` • ${job.errorCount} errors`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={job.status === "completed" ? "default" : "secondary"}
                        className={
                          job.status === "completed" ? "bg-green-100 text-green-800" :
                          job.status === "error" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {job.status}
                      </Badge>
                      {job.status === "completed" && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-3 h-3" />
                          Export
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!importJobs || importJobs.length === 0) && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No import history yet</p>
                    <p className="text-sm">Start by uploading your first CSV file</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}