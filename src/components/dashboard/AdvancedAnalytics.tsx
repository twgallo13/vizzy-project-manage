import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendUp, TrendDown, Brain, Target, Users, Clock, Lightbulb } from "@phosphor-icons/react"
import { useKV } from "@github/spark/hooks"

// Global spark API is available
declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
}

interface CampaignInsight {
  id: string
  campaign: string
  type: "performance" | "optimization" | "alert" | "prediction"
  message: string
  impact: "high" | "medium" | "low"
  confidence: number
  actionable: boolean
  trend?: "up" | "down" | "stable"
  metrics?: {
    before: number
    after?: number
    projected?: number
    metric: string
  }
}

interface PredictiveModel {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  timeframe: string
  factors: string[]
}

const mockInsights: CampaignInsight[] = [
  {
    id: "1",
    campaign: "Summer Sale Campaign",
    type: "performance",
    message: "CTR increased by 23% after adjusting audience targeting",
    impact: "high",
    confidence: 94,
    actionable: true,
    trend: "up",
    metrics: { before: 2.1, after: 2.6, metric: "CTR %" }
  },
  {
    id: "2", 
    campaign: "Brand Awareness Q2",
    type: "optimization",
    message: "Recommend shifting budget from display to social media (+15% ROI potential)",
    impact: "medium",
    confidence: 87,
    actionable: true,
    metrics: { before: 285, projected: 328, metric: "ROI %" }
  },
  {
    id: "3",
    campaign: "Product Launch",
    type: "alert",
    message: "Engagement rate dropping below benchmark - creative refresh recommended",
    impact: "high",
    confidence: 91,
    actionable: true,
    trend: "down",
    metrics: { before: 4.2, after: 3.1, metric: "Engagement %" }
  },
  {
    id: "4",
    campaign: "Holiday Preview",
    type: "prediction",
    message: "Based on historical data, expect 34% increase in conversions next month",
    impact: "high",
    confidence: 89,
    actionable: false,
    trend: "up",
    metrics: { before: 156, projected: 209, metric: "Conversions" }
  }
]

const mockPredictiveModels: PredictiveModel[] = [
  {
    metric: "Campaign ROI",
    currentValue: 324,
    predictedValue: 356,
    confidence: 87,
    timeframe: "Next 30 days",
    factors: ["Seasonal trends", "Audience expansion", "Creative optimization"]
  },
  {
    metric: "Weekly Reach",
    currentValue: 2.4,
    predictedValue: 2.8,
    confidence: 92,
    timeframe: "Next 2 weeks", 
    factors: ["Budget increase", "Platform algorithm changes", "Content virality"]
  },
  {
    metric: "Conversion Rate",
    currentValue: 3.2,
    predictedValue: 3.7,
    confidence: 83,
    timeframe: "Next 3 weeks",
    factors: ["Landing page optimization", "Audience refinement", "Seasonal behavior"]
  }
]

export function AdvancedAnalytics() {
  const [insights] = useKV<CampaignInsight[]>("campaign-insights", mockInsights)
  const [predictiveModels] = useKV<PredictiveModel[]>("predictive-models", mockPredictiveModels)
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const generateInsights = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis with Spark API
    try {
      const prompt = spark.llmPrompt`As an AI marketing analyst, generate 3 new campaign insights based on recent performance data. Focus on actionable recommendations.

Current context:
- Average ROI: 324%
- Active campaigns: 23
- Weekly reach: 2.4M
- Primary channels: Social media, Display, Search

Return insights that include performance improvements, optimization opportunities, or important alerts. Make them specific and actionable.`

      const response = await spark.llm(prompt, "gpt-4o-mini")
      
      // For demo, we'll just show the loading state
      setTimeout(() => {
        setIsAnalyzing(false)
      }, 3000)
      
    } catch (error) {
      console.error("AI analysis error:", error)
      setIsAnalyzing(false)
    }
  }

  const getInsightIcon = (type: CampaignInsight["type"]) => {
    switch (type) {
      case "performance": return TrendUp
      case "optimization": return Target
      case "alert": return Clock
      case "prediction": return Brain
      default: return Lightbulb
    }
  }

  const getImpactColor = (impact: CampaignInsight["impact"]) => {
    switch (impact) {
      case "high": return "text-red-600 bg-red-50"
      case "medium": return "text-yellow-600 bg-yellow-50"  
      case "low": return "text-green-600 bg-green-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Advanced Analytics</h3>
          <p className="text-sm text-muted-foreground">AI-powered insights and predictions</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generateInsights} 
            disabled={isAnalyzing}
            size="sm"
            className="gap-2"
          >
            <Brain className="w-4 h-4" />
            {isAnalyzing ? "Analyzing..." : "Generate Insights"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {isAnalyzing && (
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-primary animate-pulse" />
                <div>
                  <div className="font-medium">Analyzing campaign data...</div>
                  <div className="text-sm text-muted-foreground">AI is processing your marketing data to find insights</div>
                </div>
              </div>
              <Progress value={33} className="mt-4" />
            </Card>
          )}
          
          <div className="grid gap-4">
            {insights?.map((insight) => {
              const Icon = getInsightIcon(insight.type)
              return (
                <Card key={insight.id} className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{insight.campaign}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize">
                              {insight.type}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={getImpactColor(insight.impact)}
                            >
                              {insight.impact} impact
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {insight.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                      {insight.trend && (
                        <div className="flex items-center">
                          {insight.trend === "up" ? (
                            <TrendUp className="w-4 h-4 text-green-600" />
                          ) : insight.trend === "down" ? (
                            <TrendDown className="w-4 h-4 text-red-600" />
                          ) : null}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm mb-4">{insight.message}</p>
                    
                    {insight.metrics && (
                      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Before: </span>
                          <span className="font-medium">{insight.metrics.before}{insight.metrics.metric.includes('%') ? '%' : ''}</span>
                        </div>
                        {insight.metrics.after && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">After: </span>
                            <span className="font-medium">{insight.metrics.after}{insight.metrics.metric.includes('%') ? '%' : ''}</span>
                          </div>
                        )}
                        {insight.metrics.projected && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Projected: </span>
                            <span className="font-medium">{insight.metrics.projected}{insight.metrics.metric.includes('%') ? '%' : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {insight.actionable && (
                      <Button variant="outline" size="sm" className="mt-3">
                        Take Action
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictiveModels?.map((model, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    {model.metric} Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Current Value</div>
                      <div className="text-2xl font-semibold">
                        {model.currentValue}
                        {model.metric.includes('Reach') ? 'M' : model.metric.includes('ROI') ? '%' : '%'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Predicted Value</div>
                      <div className="text-2xl font-semibold text-green-600">
                        {model.predictedValue}
                        {model.metric.includes('Reach') ? 'M' : model.metric.includes('ROI') ? '%' : '%'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Confidence</span>
                      <span>{model.confidence}%</span>
                    </div>
                    <Progress value={model.confidence} />
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Key Factors</div>
                    <div className="flex flex-wrap gap-1">
                      {model.factors.map((factor, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Timeframe: {model.timeframe}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendUp className="w-8 h-8 mx-auto mb-4 opacity-50" />
                <div>Advanced trend analysis visualization will be implemented here</div>
                <div className="text-sm mt-2">Including seasonality patterns, correlation analysis, and anomaly detection</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}