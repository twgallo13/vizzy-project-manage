import { useState } from "react"
import { useKV } from "@github/spark/hooks"
import { Button } from "@/components/ui/button"
import ErrorBoundary from "@/components/common/ErrorBoundary"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ChatCircle, ChartBar, Users, Gear, Upload, Download, TrendUp, Target, Clock, Database } from "@phosphor-icons/react"
import { WeeklyPlanner } from "@/components/planner/WeeklyPlanner"
import { VizzyChat } from "@/components/chat/VizzyChat"
import { AdminPanel } from "@/components/admin/AdminPanel"
import CampaignList from "@/components/campaigns/CampaignList"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { CampaignChart } from "@/components/dashboard/CampaignChart"
import { AdvancedAnalytics } from "@/components/dashboard/AdvancedAnalytics"
import { CampaignPerformance } from "@/components/dashboard/CampaignPerformance"
import { PredictiveInsights } from "@/components/insights/PredictiveInsights"
import { InteractiveCharts } from "@/components/charts/InteractiveCharts"
import { UserManagement } from "@/components/users/UserManagement"
import { CsvIntakeCenter } from "@/components/csv/CsvIntakeCenter"
import { DataExporter } from "@/components/export/DataExporter"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface User {
  name: string
  role: string
  isOwner: boolean
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showVizzyChat, setShowVizzyChat] = useState(false)
  const [user] = useKV<User>("current-user", { name: "Marketing Manager", role: "admin", isOwner: true })
  const isMobile = useIsMobile()

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: ChartBar },
    { id: "planner", label: "Planner", icon: Calendar },
    { id: "data", label: "Data Import", icon: Database },
    { id: "users", label: "Users", icon: Users },
    { id: "admin", label: "Admin", icon: Gear }
  ]

  const mockKpis = [
    { title: "Campaign ROI", value: "324%", trend: "+12%", icon: TrendUp, color: "text-green-600" },
    { title: "Active Campaigns", value: "23", trend: "+3", icon: Target, color: "text-blue-600" },
    { title: "Weekly Reach", value: "2.4M", trend: "+8%", icon: ChartBar, color: "text-purple-600" },
    { title: "Avg. Response Time", value: "2.1h", trend: "-15%", icon: Clock, color: "text-orange-600" }
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              V
            </div>
            <h1 className="text-xl font-semibold">Vizzy</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{user?.role}</Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowVizzyChat(true)}
              className="gap-2"
            >
              <ChatCircle className="w-4 h-4" />
              {!isMobile && "Chat with Vizzy"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-64 border-r bg-card/30 min-h-[calc(100vh-64px)] p-4 space-y-6">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Saved Campaigns</h3>
              <CampaignList onOpen={(id) => {
                // TODO: load campaign into editor
                console.log('Opening campaign:', id)
              }} />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {isMobile ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <TabsTrigger key={item.id} value={item.id} className="flex flex-col gap-1 py-3">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{item.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              
              <TabsContent value="dashboard" className="space-y-4">
                <DashboardContent kpis={mockKpis} />
              </TabsContent>
              
              <TabsContent value="planner">
                <WeeklyPlanner />
              </TabsContent>
              
              <TabsContent value="data">
                <CsvIntakeCenter />
              </TabsContent>
              
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
              
              <TabsContent value="admin">
                <AdminPanel />
              </TabsContent>
            </Tabs>
          ) : (
            <div>
              {activeTab === "dashboard" && <DashboardContent kpis={mockKpis} />}
              {activeTab === "planner" && <WeeklyPlanner />}
              {activeTab === "data" && <CsvIntakeCenter />}
              {activeTab === "users" && <UserManagement />}
              {activeTab === "admin" && <AdminPanel />}
            </div>
          )}
        </main>
      </div>

      {/* Mobile FAB */}
      {isMobile && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
          onClick={() => setShowVizzyChat(true)}
        >
          <ChatCircle className="w-6 h-6" />
        </Button>
      )}

      {/* Vizzy Chat Dialog */}
      <VizzyChat open={showVizzyChat} onOpenChange={setShowVizzyChat} />
      </div>
    </ErrorBoundary>
  )
}

function DashboardContent({ kpis }: { kpis: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Marketing Dashboard</h2>
          <p className="text-muted-foreground">Overview of your marketing performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Import Data
          </Button>
          <DataExporter
            trigger={
              <Button size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CampaignChart />

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Campaign "Summer Sale" launched
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Data imported from GA4
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              Weekly report generated
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Section */}
      <AdvancedAnalytics />

      {/* Campaign Performance Section */}
      <CampaignPerformance />
      
      {/* Predictive Insights Section */}
      <PredictiveInsights />

      {/* Interactive Charts Section */}
      <InteractiveCharts />
    </div>
  )
}

export default App