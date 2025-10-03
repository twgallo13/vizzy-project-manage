import React, { useState, useRef } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Upload, FileText, Database, Trash2 } from "lucide-react"
import { listStores, importStoresFromCSV, importStoresFromJSON, clearStores } from "../../lib/stores/storeRegistry"

export function StoreRegistry() {
  const [storeCount, setStoreCount] = useState(listStores().length)
  const [isLoading, setIsLoading] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  const refreshCount = () => {
    setStoreCount(listStores().length)
  }

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const stores = await importStoresFromCSV(file)
      refreshCount()
      alert(`Imported ${stores.length} stores`)
    } catch (error) {
      alert(`Import failed: ${error}`)
    } finally {
      setIsLoading(false)
      if (csvInputRef.current) csvInputRef.current.value = ""
    }
  }

  const handleJSONImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const obj = JSON.parse(text)
        const stores = importStoresFromJSON(obj)
        refreshCount()
        alert(`Imported ${stores.length} stores`)
      } catch (error) {
        alert(`Import failed: ${error}`)
      } finally {
        setIsLoading(false)
        if (jsonInputRef.current) jsonInputRef.current.value = ""
      }
    }
    reader.readAsText(file)
  }

  const handleClear = () => {
    if (window.confirm(`Are you sure you want to clear all ${storeCount} stores?`)) {
      clearStores()
      refreshCount()
      alert("Stores cleared")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Store Registry
        </CardTitle>
        <CardDescription>
          Import and manage store locations for campaign targeting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Current stores:</span>
          <Badge variant="secondary">{storeCount}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              ref={csvInputRef}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => csvInputRef.current?.click()}
              disabled={isLoading}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>

          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleJSONImport}
              ref={jsonInputRef}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => jsonInputRef.current?.click()}
              disabled={isLoading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import JSON
            </Button>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleClear}
            disabled={isLoading || storeCount === 0}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>CSV format: id,name,city,state,region,notes</p>
          <p>JSON format: Array of store objects with same fields</p>
        </div>
      </CardContent>
    </Card>
  )
}