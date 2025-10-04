import { useState, useEffect, useRef } from "react"
import * as d3 from "d3"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendUp, TrendDown, Target, Calendar } from "@phosphor-icons/react"
import { useKV } from "../../hooks/useKV"
import { seriesForReachByWeek } from "@/lib/store/metrics"

interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "completed" | "draft"
  budget: number
  spent: number
  roi: number
  impressions: number
  clicks: number  
  conversions: number
  startDate: string
  endDate: string
  platform: string
  type: "awareness" | "conversion" | "engagement" | "retargeting"
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale Campaign",
    status: "active", 
    budget: 15000,
    spent: 8450,
    roi: 342,
    impressions: 850000,
    clicks: 12400,
    conversions: 156,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    platform: "Meta",
    type: "conversion"
  },
  {
    id: "2",
    name: "Brand Awareness Q3",
    status: "active",
    budget: 25000,
    spent: 15600,
    roi: 285,
    impressions: 1200000,
    clicks: 8900,
    conversions: 89,
    startDate: "2024-07-01", 
    endDate: "2024-09-30",
    platform: "Google Ads",
    type: "awareness"
  },
  {
    id: "3",
    name: "Product Launch Mobile",
    status: "completed",
    budget: 8000,
    spent: 7850,
    roi: 412,
    impressions: 420000,
    clicks: 6200,
    conversions: 98,
    startDate: "2024-05-15",
    endDate: "2024-06-30",
    platform: "TikTok",
    type: "awareness"
  },
  {
    id: "4",
    name: "Retargeting Campaign",
    status: "active",
    budget: 5000,
    spent: 2100,
    roi: 567,
    impressions: 180000,
    clicks: 3400,
    conversions: 78,
    startDate: "2024-07-15",
    endDate: "2024-08-15",
    platform: "Meta",
    type: "retargeting"
  }
]

export function CampaignPerformance() {
  const [campaigns] = useKV<Campaign[]>("campaign-performance", mockCampaigns)
  const [selectedMetric, setSelectedMetric] = useState("roi")
  const [selectedPlatform, setSelectedPlatform] = useState("all")
  const [sortBy, setSortBy] = useState("roi")
  const svgRef = useRef<SVGSVGElement>(null)

  const filteredCampaigns = campaigns?.filter(campaign => 
    selectedPlatform === "all" || campaign.platform === selectedPlatform
  ) || []

  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case "roi": return b.roi - a.roi
      case "spent": return b.spent - a.spent
      case "conversions": return b.conversions - a.conversions
      case "impressions": return b.impressions - a.impressions
      default: return 0
    }
  })

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "paused": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "draft": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: Campaign["type"]) => {
    switch (type) {
      case "conversion": return "bg-purple-100 text-purple-800"
      case "awareness": return "bg-blue-100 text-blue-800"
      case "engagement": return "bg-green-100 text-green-800"
      case "retargeting": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPlatformIcon = (_platform: string) => {
    // In a real app, you'd use actual platform icons
    return <Target className="w-4 h-4" />
  }

  // Calculate CTR and CPC for each campaign
  const enrichedCampaigns = sortedCampaigns.map(campaign => ({
    ...campaign,
    ctr: ((campaign.clicks / campaign.impressions) * 100).toFixed(2),
    cpc: (campaign.spent / campaign.clicks).toFixed(2),
    conversionRate: ((campaign.conversions / campaign.clicks) * 100).toFixed(2),
    budgetUtilization: (campaign.spent / campaign.budget) * 100
  }))

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const width = 600 - margin.left - margin.right
    const height = 200 - margin.top - margin.bottom

    const container = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Check if we have GA data for time series
    const weeklyData = seriesForReachByWeek()
    
    if (weeklyData.length > 0) {
      // Render time series line chart from GA data
      const parseWeek = (weekStr: string) => {
        const [year, week] = weekStr.split('-W')
        const date = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7)
        return date
      }

      const timeData = weeklyData.map(d => ({
        date: parseWeek(d.week),
        value: d.value,
        week: d.week
      }))

      const xScale = d3.scaleTime()
        .domain(d3.extent(timeData, d => d.date) as [Date, Date])
        .range([0, width])

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(timeData, d => d.value) as number])
        .range([height, 0])

      const line = d3.line<{date: Date, value: number}>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX)

      // Add line
      container.append("path")
        .datum(timeData)
        .attr("fill", "none")
        .attr("stroke", "hsl(var(--primary))")
        .attr("stroke-width", 2)
        .attr("d", line)

      // Add dots
      container.selectAll(".dot")
        .data(timeData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", 4)
        .attr("fill", "hsl(var(--primary))")

      // Add axes
      container.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d")))
        .selectAll("text")
        .style("font-size", "10px")
        .style("fill", "hsl(var(--muted-foreground))")

      container.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "10px")
        .style("fill", "hsl(var(--muted-foreground))")

    } else if (enrichedCampaigns.length > 0) {
      // Fallback to campaign bar chart
      const data = enrichedCampaigns.map(campaign => ({
        name: campaign.name.substring(0, 15) + (campaign.name.length > 15 ? "..." : ""),
        value: selectedMetric === "roi" ? campaign.roi : 
               selectedMetric === "spent" ? campaign.spent :
               selectedMetric === "conversions" ? campaign.conversions : campaign.impressions
      }))

      const xScale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, width])
        .padding(0.1)

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) as number])
        .range([height, 0])

      // Add bars
      container.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.name)!)
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.value))
        .attr("height", d => height - yScale(d.value))
        .attr("fill", "hsl(var(--primary))")
        .attr("opacity", 0.8)

      // Add axes
      container.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-size", "10px")
        .style("fill", "hsl(var(--muted-foreground))")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")

      container.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "10px")
        .style("fill", "hsl(var(--muted-foreground))")
    } else {
      // Show placeholder message
      container.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(var(--muted-foreground))")
        .style("font-size", "14px")
        .text("Import GA CSV to see data")
    }

  }, [enrichedCampaigns, selectedMetric])

  const totalBudget = enrichedCampaigns.reduce((sum, c) => sum + c.budget, 0)
  const totalSpent = enrichedCampaigns.reduce((sum, c) => sum + c.spent, 0)
  const totalConversions = enrichedCampaigns.reduce((sum, c) => sum + c.conversions, 0)
  const avgROI = enrichedCampaigns.reduce((sum, c) => sum + c.roi, 0) / enrichedCampaigns.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Campaign Performance</h3>
          <p className="text-sm text-muted-foreground">
            {enrichedCampaigns.length} campaigns • ${totalSpent.toLocaleString()} spent of ${totalBudget.toLocaleString()} budget
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Meta">Meta</SelectItem>
              <SelectItem value="Google Ads">Google Ads</SelectItem>
              <SelectItem value="TikTok">TikTok</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roi">Sort by ROI</SelectItem>
              <SelectItem value="spent">Sort by Spent</SelectItem>
              <SelectItem value="conversions">Sort by Conversions</SelectItem>
              <SelectItem value="impressions">Sort by Impressions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">Total Conversions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{avgROI.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Average ROI</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{enrichedCampaigns.filter(c => c.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Active Campaigns</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Chart</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {enrichedCampaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-base">{campaign.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(campaign.type)}>
                          {campaign.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {getPlatformIcon(campaign.platform)}
                          {campaign.platform}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{campaign.roi}%</div>
                      <div className="text-xs text-muted-foreground">ROI</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Budget</div>
                      <div className="font-semibold">${campaign.budget.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Spent</div>
                      <div className="font-semibold">${campaign.spent.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Conversions</div>
                      <div className="font-semibold">{campaign.conversions}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">CTR</div>
                      <div className="font-semibold">{campaign.ctr}%</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span>{campaign.budgetUtilization.toFixed(1)}%</span>
                    </div>
                    <Progress value={campaign.budgetUtilization} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                    <div>CPC: ${campaign.cpc}</div>
                    <div>Conv. Rate: {campaign.conversionRate}%</div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {seriesForReachByWeek().length > 0 ? "GA Weekly Reach" : "Performance Comparison"}
                </CardTitle>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roi">ROI %</SelectItem>
                    <SelectItem value="spent">Amount Spent</SelectItem>
                    <SelectItem value="conversions">Conversions</SelectItem>
                    <SelectItem value="impressions">Impressions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <svg ref={svgRef} className="w-full" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget vs Spend by Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Meta", "Google Ads", "TikTok"].map(platform => {
                    const platformCampaigns = enrichedCampaigns.filter(c => c.platform === platform)
                    const platformBudget = platformCampaigns.reduce((sum, c) => sum + c.budget, 0)
                    const platformSpent = platformCampaigns.reduce((sum, c) => sum + c.spent, 0)
                    const utilization = platformBudget > 0 ? (platformSpent / platformBudget) * 100 : 0
                    
                    if (platformBudget === 0) return null
                    
                    return (
                      <div key={platform} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{platform}</span>
                          <span>${platformSpent.toLocaleString()} / ${platformBudget.toLocaleString()}</span>
                        </div>
                        <Progress value={utilization} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {utilization.toFixed(1)}% utilized
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performing Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enrichedCampaigns
                    .sort((a, b) => b.roi - a.roi)
                    .slice(0, 4)
                    .map((campaign, index) => (
                      <div key={campaign.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{campaign.name}</div>
                            <div className="text-xs text-muted-foreground">{campaign.platform}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{campaign.roi}%</div>
                          <div className="text-xs text-muted-foreground">ROI</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Budget Optimization Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrichedCampaigns
                  .filter(c => c.roi > 300 && c.budgetUtilization < 80)
                  .slice(0, 2)
                  .map(campaign => (
                    <div key={campaign.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendUp className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">Increase budget for "{campaign.name}"</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          High ROI ({campaign.roi}%) with only {campaign.budgetUtilization.toFixed(0)}% budget used. 
                          Consider increasing budget by 25-50% to maximize performance.
                        </div>
                      </div>
                    </div>
                  ))}
                
                {enrichedCampaigns
                  .filter(c => c.roi < 200 && c.budgetUtilization > 70)
                  .slice(0, 1)
                  .map(campaign => (
                    <div key={campaign.id} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <TrendDown className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">Review "{campaign.name}" performance</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Lower ROI ({campaign.roi}%) with high budget utilization ({campaign.budgetUtilization.toFixed(0)}%). 
                          Consider optimizing targeting or creative elements.
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}