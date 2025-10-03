import { useState, useEffect, useRef } from "react"
import * as d3 from "d3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChartLine, ChartPie, ChartBarHorizontal, TrendUp } from "@phosphor-icons/react"
import { useKV } from "@github/spark/hooks"

interface ChartDataPoint {
  date: string
  metric: string
  value: number
  category: string
  platform?: string
}

interface HeatmapData {
  day: string
  hour: number
  value: number
}

const mockTimeSeriesData: ChartDataPoint[] = [
  { date: "2024-07-01", metric: "impressions", value: 45000, category: "awareness" },
  { date: "2024-07-02", metric: "impressions", value: 52000, category: "awareness" },
  { date: "2024-07-03", metric: "impressions", value: 48000, category: "awareness" },
  { date: "2024-07-04", metric: "impressions", value: 38000, category: "awareness" },
  { date: "2024-07-05", metric: "impressions", value: 67000, category: "awareness" },
  { date: "2024-07-06", metric: "impressions", value: 71000, category: "awareness" },
  { date: "2024-07-07", metric: "impressions", value: 58000, category: "awareness" },
  // Conversions data
  { date: "2024-07-01", metric: "conversions", value: 125, category: "performance" },
  { date: "2024-07-02", metric: "conversions", value: 143, category: "performance" },
  { date: "2024-07-03", metric: "conversions", value: 132, category: "performance" },
  { date: "2024-07-04", metric: "conversions", value: 98, category: "performance" },
  { date: "2024-07-05", metric: "conversions", value: 167, category: "performance" },
  { date: "2024-07-06", metric: "conversions", value: 189, category: "performance" },
  { date: "2024-07-07", metric: "conversions", value: 156, category: "performance" }
]

const mockHeatmapData: HeatmapData[] = [
  // Monday
  { day: "Mon", hour: 0, value: 12 }, { day: "Mon", hour: 1, value: 8 }, { day: "Mon", hour: 2, value: 5 },
  { day: "Mon", hour: 3, value: 3 }, { day: "Mon", hour: 4, value: 4 }, { day: "Mon", hour: 5, value: 7 },
  { day: "Mon", hour: 6, value: 15 }, { day: "Mon", hour: 7, value: 28 }, { day: "Mon", hour: 8, value: 45 },
  { day: "Mon", hour: 9, value: 67 }, { day: "Mon", hour: 10, value: 78 }, { day: "Mon", hour: 11, value: 85 },
  { day: "Mon", hour: 12, value: 82 }, { day: "Mon", hour: 13, value: 76 }, { day: "Mon", hour: 14, value: 71 },
  { day: "Mon", hour: 15, value: 69 }, { day: "Mon", hour: 16, value: 72 }, { day: "Mon", hour: 17, value: 68 },
  { day: "Mon", hour: 18, value: 58 }, { day: "Mon", hour: 19, value: 52 }, { day: "Mon", hour: 20, value: 45 },
  { day: "Mon", hour: 21, value: 38 }, { day: "Mon", hour: 22, value: 28 }, { day: "Mon", hour: 23, value: 18 },
  // Add more days...
  { day: "Tue", hour: 9, value: 72 }, { day: "Tue", hour: 10, value: 81 }, { day: "Tue", hour: 11, value: 88 },
  { day: "Wed", hour: 9, value: 69 }, { day: "Wed", hour: 10, value: 79 }, { day: "Wed", hour: 11, value: 91 },
  { day: "Thu", hour: 9, value: 75 }, { day: "Thu", hour: 10, value: 84 }, { day: "Thu", hour: 11, value: 87 },
  { day: "Fri", hour: 9, value: 71 }, { day: "Fri", hour: 10, value: 83 }, { day: "Fri", hour: 11, value: 89 }
]

export function InteractiveCharts() {
  const [timeSeriesData] = useKV<ChartDataPoint[]>("timeseries-data", mockTimeSeriesData)
  const [heatmapData] = useKV<HeatmapData[]>("heatmap-data", mockHeatmapData)
  const [selectedMetric, setSelectedMetric] = useState("impressions")
  const [chartType, setChartType] = useState("line")
  const timeSeriesRef = useRef<SVGSVGElement>(null)
  const heatmapRef = useRef<SVGSVGElement>(null)
  const correlationRef = useRef<SVGSVGElement>(null)

  // Time Series Chart
  useEffect(() => {
    if (!timeSeriesRef.current || !timeSeriesData) return

    const svg = d3.select(timeSeriesRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 300 - margin.top - margin.bottom

    const container = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Filter data for selected metric
    const filteredData = timeSeriesData
      .filter(d => d.metric === selectedMetric)
      .map(d => ({ ...d, date: new Date(d.date) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredData, d => d.date) as [Date, Date])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => d.value) as number * 1.1])
      .range([height, 0])

    // Add gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0)

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "hsl(var(--primary))")
      .attr("stop-opacity", 0.1)

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "hsl(var(--primary))")
      .attr("stop-opacity", 0.6)

    if (chartType === "line" || chartType === "area") {
      const line = d3.line<typeof filteredData[0]>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX)

      if (chartType === "area") {
        const area = d3.area<typeof filteredData[0]>()
          .x(d => xScale(d.date))
          .y0(height)
          .y1(d => yScale(d.value))
          .curve(d3.curveMonotoneX)

        container.append("path")
          .datum(filteredData)
          .attr("fill", "url(#area-gradient)")
          .attr("d", area)
      }

      container.append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", "hsl(var(--primary))")
        .attr("stroke-width", 2)
        .attr("d", line)

      // Add data points
      container.selectAll(".dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", 4)
        .attr("fill", "hsl(var(--primary))")
        .style("cursor", "pointer")
    } else if (chartType === "bar") {
      container.selectAll(".bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.date) - 10)
        .attr("width", 20)
        .attr("y", d => yScale(d.value))
        .attr("height", d => height - yScale(d.value))
        .attr("fill", "hsl(var(--primary))")
        .attr("opacity", 0.8)
    }

    // Add axes
    container.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d")))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--muted-foreground))")

    container.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--muted-foreground))")

  }, [timeSeriesData, selectedMetric, chartType])

  // Heatmap Chart
  useEffect(() => {
    if (!heatmapRef.current || !heatmapData) return

    const svg = d3.select(heatmapRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const width = 600 - margin.left - margin.right
    const height = 200 - margin.top - margin.bottom

    const container = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const days = [...new Set(heatmapData.map(d => d.day))]
    const hours = [...new Set(heatmapData.map(d => d.hour))].sort((a, b) => a - b)

    const xScale = d3.scaleBand()
      .domain(hours.map(String))
      .range([0, width])
      .padding(0.05)

    const yScale = d3.scaleBand()
      .domain(days)
      .range([0, height])
      .padding(0.05)

    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateBlues)
      .domain([0, d3.max(heatmapData, d => d.value) as number])

    container.selectAll(".heatmap-cell")
      .data(heatmapData)
      .enter().append("rect")
      .attr("class", "heatmap-cell")
      .attr("x", d => xScale(String(d.hour))!)
      .attr("y", d => yScale(d.day)!)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(d.value))
      .style("cursor", "pointer")

    // Add axes
    container.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "hsl(var(--muted-foreground))")

    container.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--muted-foreground))")

  }, [heatmapData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Interactive Data Visualization</h3>
          <p className="text-sm text-muted-foreground">Advanced charts and analytics</p>
        </div>
      </div>

      <Tabs defaultValue="timeseries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeseries">Time Series</TabsTrigger>
          <TabsTrigger value="heatmap">Activity Heatmap</TabsTrigger>
          <TabsTrigger value="correlation">Correlation Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="timeseries" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ChartLine className="w-5 h-5" />
                  Performance Trends
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="impressions">Impressions</SelectItem>
                      <SelectItem value="conversions">Conversions</SelectItem>
                      <SelectItem value="clicks">Clicks</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <svg ref={timeSeriesRef} className="w-full" />
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span>{selectedMetric}</span>
                </div>
                <Badge variant="outline">
                  7-day trend
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBarHorizontal className="w-5 h-5" />
                Engagement Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <svg ref={heatmapRef} className="w-full" />
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Shows user engagement intensity by day and hour. Darker colors indicate higher engagement.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendUp className="w-5 h-5" />
                Metric Correlations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendUp className="w-8 h-8 mx-auto mb-4 opacity-50" />
                <div>Correlation matrix visualization</div>
                <div className="text-sm mt-2">Shows relationships between different marketing metrics</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}