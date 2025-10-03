import React, { useState, useRef } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Upload, BarChart3, Mail, Package, Trash2 } from "lucide-react"
import { parseCsv, rowsToObjects } from "../../lib/ingest/csv"
import { getMetrics, appendMetrics, clearMetrics } from "../../lib/store/metrics"

export function IntakeCenter() {
  const [metrics, setMetrics] = useState(getMetrics())
  const [isLoading, setIsLoading] = useState(false)
  
  const gaInputRef = useRef<HTMLInputElement>(null)
  const espInputRef = useRef<HTMLInputElement>(null)
  const productInputRef = useRef<HTMLInputElement>(null)

  const refreshMetrics = () => {
    setMetrics(getMetrics())
  }

  const handleCsvUpload = (type: 'ga' | 'esp' | 'product', file: File) => {
    setIsLoading(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const rows = parseCsv(text)
        const objects = rowsToObjects(rows)
        
        appendMetrics(type, objects)
        refreshMetrics()
        
        alert(`Imported ${objects.length} ${type.toUpperCase()} records`)
      } catch (error) {
        alert(`Import failed: ${error}`)
      } finally {
        setIsLoading(false)
      }
    }
    
    reader.onerror = () => {
      alert("Failed to read file")
      setIsLoading(false)
    }
    
    reader.readAsText(file)
  }

  const handleGaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleCsvUpload('ga', file)
      if (gaInputRef.current) gaInputRef.current.value = ""
    }
  }

  const handleEspUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleCsvUpload('esp', file)
      if (espInputRef.current) espInputRef.current.value = ""
    }
  }

  const handleProductUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleCsvUpload('product', file)
      if (productInputRef.current) productInputRef.current.value = ""
    }
  }

  const handleClear = (type: 'ga' | 'esp' | 'product') => {
    const count = metrics[type].length
    if (window.confirm(`Are you sure you want to clear all ${count} ${type.toUpperCase()} records?`)) {
      clearMetrics(type)
      refreshMetrics()
      alert(`Cleared ${type.toUpperCase()} data`)
    }
  }

  const handleClearAll = () => {
    const total = metrics.ga.length + metrics.esp.length + metrics.product.length
    if (window.confirm(`Are you sure you want to clear ALL ${total} records?`)) {
      clearMetrics()
      refreshMetrics()
      alert("Cleared all metrics data")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          CSV Intake Center
        </CardTitle>
        <CardDescription>
          Import performance snapshots from GA, ESP, and Product feeds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current counts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Google Analytics</span>
            </div>
            <Badge variant="secondary">{metrics.ga.length}</Badge>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">ESP Data</span>
            </div>
            <Badge variant="secondary">{metrics.esp.length}</Badge>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Product Feed</span>
            </div>
            <Badge variant="secondary">{metrics.product.length}</Badge>
          </div>
        </div>

        {/* Upload sections */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* GA Upload */}
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleGaUpload}
                ref={gaInputRef}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => gaInputRef.current?.click()}
                disabled={isLoading}
                className="w-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Import GA CSV
              </Button>
            </div>

            {/* ESP Upload */}
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleEspUpload}
                ref={espInputRef}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => espInputRef.current?.click()}
                disabled={isLoading}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Import ESP CSV
              </Button>
            </div>

            {/* Product Upload */}
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleProductUpload}
                ref={productInputRef}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => productInputRef.current?.click()}
                disabled={isLoading}
                className="w-full"
              >
                <Package className="h-4 w-4 mr-2" />
                Import Product CSV
              </Button>
            </div>
          </div>

          {/* Clear buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleClear('ga')}
              disabled={isLoading || metrics.ga.length === 0}
            >
              Clear GA
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleClear('esp')}
              disabled={isLoading || metrics.esp.length === 0}
            >
              Clear ESP
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleClear('product')}
              disabled={isLoading || metrics.product.length === 0}
            >
              Clear Product
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading || (metrics.ga.length + metrics.esp.length + metrics.product.length === 0)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>CSV files should have headers in the first row.</p>
          <p>Data is stored locally in browser storage.</p>
        </div>
      </CardContent>
    </Card>
  )
}