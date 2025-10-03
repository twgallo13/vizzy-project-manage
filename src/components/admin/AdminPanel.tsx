import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Key, Palette, Upload, Shield, FileText, Activity } from "@phosphor-icons/react"
import { useKV } from "@github/spark/hooks"
import { toast } from "sonner"

interface AIProvider {
  name: string
  key: string
  status: "connected" | "disconnected" | "testing"
  usage: string
}

interface BrandSettings {
  logo: string
  primaryColor: string
  theme: string
}

export function AdminPanel() {
  const [aiProviders, setAiProviders] = useKV<Record<string, AIProvider>>("ai-providers", {
    openai: { name: "OpenAI", key: "", status: "disconnected", usage: "Reasoning, Text Generation" },
    gemini: { name: "Google Gemini", key: "", status: "disconnected", usage: "Vision, Multimodal Analysis" }
  })
  
  const [brandSettings, setBrandSettings] = useKV<BrandSettings>("brand-settings", {
    logo: "/assets/logo-placeholder.svg",
    primaryColor: "#3B82F6",
    theme: "light"
  })

  const testConnection = async (provider: string) => {
    if (!aiProviders) return
    
    setAiProviders(prev => ({
      ...(prev || {}),
      [provider]: { ...((prev || {})[provider] || {}), status: "testing" }
    }))

    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate for demo
      setAiProviders(prev => ({
        ...(prev || {}),
        [provider]: { 
          ...((prev || {})[provider] || {}), 
          status: success ? "connected" : "disconnected" 
        }
      }))
      
      if (success) {
        toast.success(`${aiProviders[provider].name} connected successfully`)
      } else {
        toast.error(`Failed to connect to ${aiProviders[provider].name}`)
      }
    }, 2000)
  }

  const updateProviderKey = (provider: string, key: string) => {
    if (!aiProviders) return
    setAiProviders(prev => ({
      ...(prev || {}),
      [provider]: { ...((prev || {})[provider] || {}), key }
    }))
  }

  const setupChecklist = [
    { id: "branding", label: "Upload logo and set brand colors", completed: !!brandSettings?.logo },
    { id: "ai-keys", label: "Configure AI provider keys", completed: Object.values(aiProviders || {}).some(p => p.status === "connected") },
    { id: "routing", label: "Set up model routing preferences", completed: false },
    { id: "security", label: "Configure authentication and MFA", completed: false },
    { id: "wrike", label: "Test Wrike export functionality", completed: false }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Admin Panel</h2>
        <p className="text-muted-foreground">Manage system settings and configuration</p>
      </div>

      {/* Setup Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Setup Checklist
          </CardTitle>
          <CardDescription>
            Complete these steps to fully configure Vizzy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {setupChecklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                item.completed ? "bg-green-500 border-green-500" : "border-gray-300"
              }`}>
                {item.completed && <div className="w-full h-full rounded-full bg-white scale-50" />}
              </div>
              <span className={item.completed ? "text-muted-foreground line-through" : ""}>
                {item.label}
              </span>
              {item.completed && <Badge variant="secondary" className="ml-auto">Done</Badge>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="ai-settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                AI Provider Configuration
              </CardTitle>
              <CardDescription>
                Configure API keys and routing for AI providers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(aiProviders || {}).map(([key, provider]) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">{provider.usage}</p>
                    </div>
                    <Badge 
                      variant={provider.status === "connected" ? "default" : "secondary"}
                      className={
                        provider.status === "connected" ? "bg-green-100 text-green-800" :
                        provider.status === "testing" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }
                    >
                      {provider.status}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="API Key"
                      value={provider.key}
                      onChange={(e) => updateProviderKey(key, e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => testConnection(key)}
                      disabled={!provider.key || provider.status === "testing"}
                    >
                      {provider.status === "testing" ? "Testing..." : "Test"}
                    </Button>
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Brand & Theme Settings
              </CardTitle>
              <CardDescription>
                Customize the appearance and branding of Vizzy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Brand Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={brandSettings?.primaryColor || "#3B82F6"}
                    onChange={(e) => setBrandSettings(prev => ({ 
                      logo: prev?.logo || "/assets/logo-placeholder.svg",
                      theme: prev?.theme || "light",
                      primaryColor: e.target.value 
                    }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={brandSettings?.primaryColor || "#3B82F6"}
                    onChange={(e) => setBrandSettings(prev => ({ 
                      logo: prev?.logo || "/assets/logo-placeholder.svg",
                      theme: prev?.theme || "light",
                      primaryColor: e.target.value 
                    }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Security configuration will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Integration management will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Audit log will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}