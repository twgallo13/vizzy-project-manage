import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useKV } from "@github/spark/hooks"
import { PaperPlaneRight, Robot, User, Sparkle } from "@phosphor-icons/react"
import { createCampaignWithAI } from "@/lib/client/createCampaignWithAI"

declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
    }
  }
}

const spark = window.spark

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  command?: string
}

interface VizzyChatProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VizzyChat({ open, onOpenChange }: VizzyChatProps) {
  const [messages, setMessages] = useKV<ChatMessage[]>("vizzy-chat-messages", [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successCampaign, setSuccessCampaign] = useState<{ name: string } | null>(null)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...(prev || []), userMessage])
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
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...(prev || []), assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...(prev || []), errorMessage])
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

    setLoading(true)
    setError(null)
    setSuccessCampaign(null)

    try {
      const campaign = await createCampaignWithAI(input.trim())
      console.log("AI Campaign created:", campaign)
      setSuccessCampaign({ name: campaign?.name || "New Campaign" })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot className="w-5 h-5 text-primary" />
            Chat with Vizzy
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4 pb-4">
            {messages?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Robot className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">Hi! I'm Vizzy, your AI marketing assistant.</p>
                <p className="text-sm mt-2">Ask me about your campaigns, data, or try commands like /explain or /status</p>
              </div>
            ) : (
              messages?.map((message) => (
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
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>

                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

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
          </div>
        </ScrollArea>

        <div className="pt-4 border-t space-y-3">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}
          
          {successCampaign && (
            <div className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200 flex items-center justify-between">
              <span>✓ Campaign "{successCampaign.name}" created successfully!</span>
              <button
                onClick={resetForm}
                className="text-green-600 hover:text-green-800 text-xs underline ml-2"
              >
                Create another
              </button>
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
                disabled={!input.trim() || isLoading || loading}
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