import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import { PaperPlaneRight, Robot, User, Sparkle } from "@phosphor-icons/react"
import { createCampaignWithAI } from "@/lib/client/createCampaignWithAI"
import { persistCampaign } from "@/lib/store/campaigns"

declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
    }
  }
}

const spark = window.spark
const CHAT_KEY = "vizzy:chat"

interface ChatMessage {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: Date | string | number
  command?: string
}

function toDate(ts: Date | string | number | undefined): Date {
  if (!ts) return new Date()
  if (ts instanceof Date) return ts
  const d = new Date(ts)
  return isNaN(d.getTime()) ? new Date() : d
}

function normalizeMessage(m: ChatMessage): ChatMessage & { timestamp: Date } {
  return { ...m, timestamp: toDate(m.timestamp) }
}

function formatTime(ts: Date | string | number): string {
  const d = ts instanceof Date ? ts : new Date(ts)
  if (isNaN(d.getTime())) return ""
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

interface VizzyChatProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VizzyChat({ open, onOpenChange }: VizzyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const s = localStorage.getItem(CHAT_KEY)
    try { return s ? JSON.parse(s) : [] } catch { return [] }
  })
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successCampaign, setSuccessCampaign] = useState<{ name: string } | null>(null)
  const [lastCreatedCampaign, setLastCreatedCampaign] = useState<any>(null)
  const [lastBrief, setLastBrief] = useState<string>("")
  const [lastCallAt, setLastCallAt] = useState<number>(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)



  // Auto-scroll when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Persist messages to localStorage
  useEffect(() => { 
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages)) 
  }, [messages])

  // Check if AI calls are throttled (within 10 seconds)
  const isThrottled = () => {
    const now = Date.now()
    return (now - lastCallAt) < 10000 // 10 seconds
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const nowISO = new Date().toISOString()
    const userMessage: ChatMessage = {
      id: String(Date.now()),
      type: "user",
      content: input.trim(),
      timestamp: nowISO
    }

    setMessages(prev => [...(prev || []), normalizeMessage(userMessage)])
    setInput("")
    setIsLoading(true)

    try {
      // Use the global spark API
      const prompt = spark.llmPrompt`You are Vizzy, a helpful AI marketing assistant. The user said: ${input.trim()}

Available commands:
- /simulate: Run campaign simulations
- /analyze: Analyze performance data
- /optimize: Suggest optimizations
- /status: Show current campaign status
- /explain: Explain marketing concepts

Context: This is a marketing analytics platform called Vizzy.
Provide a helpful, conversational response focused on marketing insights and actionable advice.`

      const response = await spark.llm(prompt)
      
      const nowISO = new Date().toISOString()
      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1),
        type: "assistant",
        content: response,
        timestamp: nowISO
      }

      setMessages(prev => [...(prev || []), normalizeMessage(assistantMessage)])
    } catch (error) {
      const nowISO = new Date().toISOString()
      const errorMessage: ChatMessage = {
        id: String(Date.now() + 1),
        type: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: nowISO
      }
      setMessages(prev => [...(prev || []), normalizeMessage(errorMessage)])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const onCreateWithAI = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    // Check for throttling
    if (isThrottled()) {
      return
    }

    const brief = input.trim()
    setLoading(true)
    setError(null)
    setSuccessCampaign(null)
    setLastBrief(brief)
    setLastCallAt(Date.now())

    try {
      const campaign = await createCampaignWithAI(brief)
      console.log("AI Campaign created:", campaign)
      
      // Ensure campaign has required fields
      const campaignToSave = {
        ...campaign,
        id: campaign?.id || String(Date.now()),
        createdBy: "ai" as const,
        createdAt: campaign?.createdAt || new Date().toISOString()
      }
      
      // Save to store
      await persistCampaign(campaignToSave)
      
      setSuccessCampaign({ name: campaign?.name || "New Campaign" })
      setLastCreatedCampaign(campaignToSave)
      
      // Add success message to chat
      const nowISO = new Date().toISOString()
      const successMessage: ChatMessage = {
        id: String(Date.now() + 2),
        type: "assistant",
        content: `✅ Created: ${campaign?.name || "New Campaign"} • Saved`,
        timestamp: nowISO
      }
      setMessages(prev => [...(prev || []), normalizeMessage(successMessage)])
      
      setInput("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setError(null)
    setSuccessCampaign(null)
    setInput("")
  }

  const handleRetry = async () => {
    if (!lastBrief || loading) return
    
    // Check for throttling
    if (isThrottled()) {
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccessCampaign(null)
    setLastCallAt(Date.now())

    try {
      const campaign = await createCampaignWithAI(lastBrief)
      console.log("AI Campaign created (retry):", campaign)
      
      // Ensure campaign has required fields
      const campaignToSave = {
        ...campaign,
        id: campaign?.id || String(Date.now()),
        createdBy: "ai" as const,
        createdAt: campaign?.createdAt || new Date().toISOString()
      }
      
      // Save to store
      await persistCampaign(campaignToSave)
      
      setSuccessCampaign({ name: campaign?.name || "New Campaign" })
      setLastCreatedCampaign(campaignToSave)
      
      // Add success message to chat
      const nowISO = new Date().toISOString()
      const successMessage: ChatMessage = {
        id: String(Date.now() + 2),
        type: "assistant",
        content: `✅ Retried: ${campaign?.name || "New Campaign"} • Saved`,
        timestamp: nowISO
      }
      setMessages(prev => [...(prev || []), normalizeMessage(successMessage)])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyJSON = async () => {
    if (!lastCreatedCampaign) return
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(lastCreatedCampaign, null, 2))
      // Could add a toast notification here if desired
    } catch (err) {
      console.error("Failed to copy JSON:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent forceMount className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Robot className="w-5 h-5 text-primary" />
            Chat with Vizzy
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea ref={scrollContainerRef} className="h-full pr-4">
            <div className="space-y-4 pb-4">
            {(() => {
              const normalizedMessages = (messages || []).map(normalizeMessage)
              return normalizedMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Robot className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">Hi! I'm Vizzy, your AI marketing assistant.</p>
                <p className="text-sm mt-2">Ask me about your campaigns, data, or try commands like /explain or /status</p>
              </div>
            ) : (
              normalizedMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Robot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>

                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )})()}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Robot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            
            <div id="chat-end" ref={endRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="pt-4 border-t space-y-3 flex-shrink-0">
          {isThrottled() && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
              Please wait a moment…
            </div>
          )}
          
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded flex items-center justify-between">
              <span>{error}</span>
              {lastBrief && (
                <button
                  onClick={handleRetry}
                  disabled={loading || isThrottled()}
                  className="text-destructive hover:text-destructive/80 text-xs underline ml-2"
                >
                  Retry
                </button>
              )}
            </div>
          )}
          
          {successCampaign && (
            <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center justify-between">
              <span>✓ Campaign "{successCampaign.name}" created successfully!</span>
              <div className="flex gap-2">
                {lastCreatedCampaign && (
                  <button
                    onClick={handleCopyJSON}
                    className="text-green-600 hover:text-green-800 text-xs underline"
                  >
                    Copy JSON
                  </button>
                )}
                <button
                  onClick={resetForm}
                  className="text-green-600 hover:text-green-800 text-xs underline"
                >
                  Create another
                </button>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask Vizzy about your campaigns, data, or use commands like /explain..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[44px] max-h-[120px] resize-none"
              disabled={isLoading || loading}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || loading}
                size="sm"
              >
                <PaperPlaneRight className="w-4 h-4" />
              </Button>
              <Button
                onClick={onCreateWithAI}
                disabled={!input.trim() || isLoading || loading || isThrottled()}
                size="sm"
                variant="outline"
              >
                <Sparkle className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Use the sparkle button to create campaigns with AI, or send a message to chat
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}