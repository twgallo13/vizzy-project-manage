import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useKV } from "../../hooks/useKV"

interface ChartData {
  date: string
  campaigns: number
  roi: number
  reach: number
  engagement: number
}

const mockData: ChartData[] = [
  { date: "2024-01-01", campaigns: 15, roi: 285, reach: 1800000, engagement: 3.2 },
  { date: "2024-01-08", campaigns: 18, roi: 312, reach: 2100000, engagement: 3.8 },
  { date: "2024-01-15", campaigns: 22, roi: 298, reach: 2300000, engagement: 4.1 },
  { date: "2024-01-22", campaigns: 20, roi: 334, reach: 2200000, engagement: 3.9 },
  { date: "2024-01-29", campaigns: 25, roi: 356, reach: 2500000, engagement: 4.3 },
  { date: "2024-02-05", campaigns: 28, roi: 289, reach: 2400000, engagement: 3.7 },
  { date: "2024-02-12", campaigns: 23, roi: 324, reach: 2400000, engagement: 4.2 }
]

export function CampaignChart() {
  const svgRef = useRef<SVGSVGElement>(null)
  const [chartData] = useKV<ChartData[]>("campaign-chart-data", mockData)

  useEffect(() => {
    if (!svgRef.current || !chartData) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 80, bottom: 40, left: 60 }
    const width = 800 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top

    const container = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Parse dates
    const parseDate = d3.timeParse("%Y-%m-%d")
    const data = chartData.map(d => ({
      ...d,
      parsedDate: parseDate(d.date)!
    }))

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.parsedDate) as [Date, Date])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.roi) as number])
      .range([height, 0])

    const reachScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.reach) as number])
      .range([height, 0])

    // Line generators
    const roiLine = d3.line<typeof data[0]>()
      .x(d => xScale(d.parsedDate))
      .y(d => yScale(d.roi))
      .curve(d3.curveMonotoneX)

    const reachLine = d3.line<typeof data[0]>()
      .x(d => xScale(d.parsedDate))
      .y(d => reachScale(d.reach))
      .curve(d3.curveMonotoneX)

    // Add axes
    container.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--muted-foreground))")

    container.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--muted-foreground))")

    container.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(reachScale).tickFormat(d => `${(d as number / 1000000).toFixed(1)}M`))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--muted-foreground))")

    // Add grid lines
    container.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "hsl(var(--border))")
      .style("opacity", 0.3)

    container.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "hsl(var(--border))")
      .style("opacity", 0.3)

    // Add ROI line
    container.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-width", 3)
      .attr("d", roiLine)

    // Add reach line
    container.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "hsl(var(--accent))")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", reachLine)

    // Add data points for ROI
    container.selectAll(".roi-dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "roi-dot")
      .attr("cx", d => xScale(d.parsedDate))
      .attr("cy", d => yScale(d.roi))
      .attr("r", 4)
      .attr("fill", "hsl(var(--primary))")
      .style("cursor", "pointer")

    // Add data points for reach
    container.selectAll(".reach-dot")
      .data(data)
      .enter().append("circle")
      .attr("class", "reach-dot")
      .attr("cx", d => xScale(d.parsedDate))
      .attr("cy", d => reachScale(d.reach))
      .attr("r", 3)
      .attr("fill", "hsl(var(--accent))")
      .style("cursor", "pointer")

    // Add legend
    const legend = container.append("g")
      .attr("transform", `translate(${width - 160}, 20)`)

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 4)
      .attr("fill", "hsl(var(--primary))")

    legend.append("text")
      .attr("x", 10)
      .attr("y", 5)
      .text("ROI (%)")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--foreground))")

    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 20)
      .attr("r", 3)
      .attr("fill", "hsl(var(--accent))")

    legend.append("text")
      .attr("x", 10)
      .attr("y", 25)
      .text("Reach (M)")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--foreground))")

    // Add labels
    container.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--muted-foreground))")
      .text("ROI (%)");

    container.append("text")
      .attr("transform", `translate(${width + margin.right - 20}, ${height / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "hsl(var(--muted-foreground))")
      .text("Reach (Millions)");

  }, [chartData])

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Campaign Performance Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg ref={svgRef} className="w-full h-[300px]" />
        </div>
      </CardContent>
    </Card>
  )
}