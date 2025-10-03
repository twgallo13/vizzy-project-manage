import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, TrendUp, Target, Calendar, Warning, Lightbulb } from "@phosphor-icons/react"
import { useKV } from "../../hooks/useKV"

// Global spark API is available
declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
}

interface Prediction {
  id: string
  title: string
  description: string
  confidence: number
  timeframe: "1-week" | "2-weeks" | "1-month" | "3-months"
  type: "opportunity" | "risk" | "trend" | "optimization"
  impact: "high" | "medium" | "low"
  metric: string
  currentValue: number
  predictedValue: number
  factors: string[]
  recommendation: string
}

interface SeasonalTrend {
  period: string
  historical: number
  predicted: number
  variance: number
  confidence: number
}

const mockPredictions: Prediction[] = [
  {
    id: "1",
    title: "Q4 Holiday Campaign Performance",
    description: "Based on historical trends and current market conditions, expect significant performance increase during November-December period",
    confidence: 94,
    timeframe: "3-months",
    type: "opportunity",
    impact: "high",
    metric: "ROI",
    currentValue: 324,
    predictedValue: 445,
    factors: ["Holiday shopping behavior", "Increased ad inventory", "Historical Q4 performance", "Competition analysis"],
    recommendation: "Increase budget allocation by 35% starting October 15th and prepare seasonal creative assets"
  },
  {
    id: "2", 
    title: "Mobile Conversion Rate Optimization",
    description: "Machine learning model predicts mobile conversion improvements with landing page optimization",
    confidence: 87,
    timeframe: "2-weeks",
    type: "optimization",
    impact: "medium",
    metric: "Mobile CVR",
    currentValue: 2.8,
    predictedValue: 3.4,
    factors: ["Page load speed improvements", "Mobile UX optimization", "Form simplification", "Trust signals"],
    recommendation: "Implement mobile-first landing page redesign focusing on load speed and simplified checkout flow"
  },
  {
    id: "3",
    title: "Ad Fatigue Risk Alert", 
    description: "Current creative assets showing declining engagement metrics, suggesting audience fatigue",
    confidence: 89,
    timeframe: "1-week",
    type: "risk",
    impact: "high",
    metric: "CTR",
    currentValue: 3.2,
    predictedValue: 2.1,
    factors: ["Creative frequency", "Audience saturation", "Engagement decline", "Historical patterns"],
    recommendation: "Refresh creative assets immediately and implement dynamic creative rotation strategy"
  },
  {
    id: "4",
    title: "Emerging Platform Opportunity",
    description: "Data suggests strong potential for campaign expansion to TikTok based on target demographic analysis",
    confidence: 76,
    timeframe: "1-month",
    type: "opportunity", 
    impact: "medium",
    metric: "Reach",
    currentValue: 2.4,
    predictedValue: 3.2,
    factors: ["Demographic alignment", "Platform growth trends", "Cost efficiency", "Creative fit"],
    recommendation: "Allocate 15% of social media budget to TikTok pilot campaign with video-first creative strategy"
  }
]

const mockSeasonalTrends: SeasonalTrend[] = [
  { period: "Jan", historical: 285, predicted: 295, variance: 8.2, confidence: 91 },
  { period: "Feb", historical: 298, predicted: 312, variance: 12.1, confidence: 87 },
  { period: "Mar", historical: 334, predicted: 345, variance: 15.3, confidence: 89 },
  { period: "Apr", historical: 312, predicted: 298, variance: -11.2, confidence: 92 },
  { period: "May", historical: 356, predicted: 378, variance: 18.4, confidence: 85 }
]

export function PredictiveInsights() {
  const [predictions] = useKV<Prediction[]>("ai-predictions", mockPredictions)
  const [seasonalTrends] = useKV<SeasonalTrend[]>("seasonal-trends", mockSeasonalTrends)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all")

  const generateNewInsights = async () => {
    setIsGenerating(true)
    
    try {
      const prompt = spark.llmPrompt`As a predictive marketing AI, analyze current campaign performance and generate 2 new actionable predictions.

Current Performance Context:
- Average ROI: 324%
- Active Campaigns: 23
- Weekly Reach: 2.4M users  
- Primary Channels: Meta, Google Ads, TikTok
- Current Season: Late Summer transitioning to Fall
- Budget Utilization: 73% across all campaigns

Generate predictions focusing on:
1. One high-confidence opportunity (>85% confidence)
2. One optimization recommendation (>80% confidence)

For each prediction include:
- Specific metric impact (numbers)
- Timeframe for expected results
- 3-4 key driving factors
- Actionable recommendation

Keep predictions realistic and based on common marketing patterns.`

      const response = await spark.llm(prompt, "gpt-4o-mini")
      
      // In a real implementation, we'd parse the AI response and add it to predictions
      // For now, just simulate the process
      setTimeout(() => {
        setIsGenerating(false)
      }, 4000)
      
    } catch (error) {
      console.error("AI prediction error:", error)
      setIsGenerating(false)
    }
  }

  const getTypeIcon = (type: Prediction["type"]) => {
    switch (type) {
      case "opportunity": return TrendUp
      case "risk": return Warning
      case "trend": return Calendar
      case "optimization": return Target
      default: return Lightbulb
    }
  }

  const getTypeColor = (type: Prediction["type"]) => {
    switch (type) {
      case "opportunity": return "text-green-600 bg-green-50"
      case "risk": return "text-red-600 bg-red-50"
      case "trend": return "text-blue-600 bg-blue-50"
      case "optimization": return "text-purple-600 bg-purple-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getImpactColor = (impact: Prediction["impact"]) => {
    switch (impact) {
      case "high": return "text-red-600"
      case "medium": return "text-yellow-600"  
      case "low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  const filteredPredictions = predictions?.filter(p => 
    selectedTimeframe === "all" || p.timeframe === selectedTimeframe
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Predictive Insights
          </h3>
          <p className="text-sm text-muted-foreground">AI-powered predictions and recommendations</p>
        </div>
        <Button 
          onClick={generateNewInsights} 
          disabled={isGenerating}
          className="gap-2"
        >
          <Brain className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Generate New Insights"}
        </Button>
      </div>

      {isGenerating && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-primary animate-pulse" />
              <div>
                <div className="font-medium">AI Analysis in Progress</div>
                <div className="text-sm text-muted-foreground">
                  Processing campaign data, market trends, and seasonal patterns...
                </div>
              </div>
            </div>
            <Progress value={67} className="mb-2" />
            <div className="text-xs text-muted-foreground">
              Analyzing {mockPredictions.length} data sources • Confidence modeling • Pattern recognition
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredPredictions.map((prediction) => {
          const Icon = getTypeIcon(prediction.type)
          const changePercent = ((prediction.predictedValue - prediction.currentValue) / prediction.currentValue * 100)
          
          return (
            <Card key={prediction.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getTypeColor(prediction.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2">{prediction.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-3">
                        {prediction.description}
                      </p>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="capitalize">
                          {prediction.type}
                        </Badge>
                        <Badge variant="secondary" className={getImpactColor(prediction.impact)}>
                          {prediction.impact} impact
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {prediction.confidence}% confidence
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {prediction.timeframe}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">{prediction.metric}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Current</div>
                    <div className="font-semibold">
                      {prediction.currentValue}
                      {prediction.metric.includes('ROI') || prediction.metric.includes('CVR') || prediction.metric.includes('CTR') ? '%' : 
                       prediction.metric.includes('Reach') ? 'M' : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Predicted</div>
                    <div className="font-semibold text-primary">
                      {prediction.predictedValue}
                      {prediction.metric.includes('ROI') || prediction.metric.includes('CVR') || prediction.metric.includes('CTR') ? '%' : 
                       prediction.metric.includes('Reach') ? 'M' : ''}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Key Factors</div>
                  <div className="flex flex-wrap gap-1">
                    {prediction.factors.map((factor, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Recommendation:</strong> {prediction.recommendation}
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button variant="default" size="sm">
                    Implement Suggestion
                  </Button>
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seasonal Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {seasonalTrends?.map((trend) => (
              <div key={trend.period} className="text-center p-3 rounded-lg border">
                <div className="font-medium text-sm">{trend.period}</div>
                <div className="text-lg font-bold text-primary">{trend.predicted}</div>
                <div className="text-xs text-muted-foreground">
                  vs {trend.historical} historical
                </div>
                <div className={`text-xs font-medium ${trend.variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.variance > 0 ? '+' : ''}{trend.variance.toFixed(1)}%
                </div>
                <Progress value={trend.confidence} className="mt-2 h-1" />
                <div className="text-xs text-muted-foreground mt-1">
                  {trend.confidence}% confidence
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}