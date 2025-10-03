import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PaperPlaneRight, Robot, User } from "@phosphor-icons/react"
import { toLocalHM } from "@/lib/util/dates"
import { persistCampaign } from "@/lib/store/campaigns"
import { useChatThread, useAssistantResponse } from "@/hooks/useChatThread"
import { toast } from "sonner"

declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
    }
  }
}

const spark = window.spark

interface VizzyChatProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCampaignCreated?: (campaignId: string) => void
}

export function VizzyChat({ open, onOpenChange, onCampaignCreated }: VizzyChatProps) {
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // Use persistent chat thread
  const { threadId, messages, isLoading, sendMessage, error } = useChatThread({ autoLoad: open })
  const { addAssistantMessage } = useAssistantResponse(threadId)
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollArea = scrollAreaRef.current
    if (scrollArea && messages.length > 0) {
      const scrollContainer = scrollArea.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const userInput = input.trim()
    setInput("")

    try {
      // Send user message via persistent storage
      await sendMessage(userInput)
      
      // Check if user wants to create a campaign
      const isCreatingCampaign = /create|new|build.*campaign/i.test(userInput)
      
      if (isCreatingCampaign) {
        // Use the global spark API for campaign creation
        const prompt = spark.llmPrompt`You are Vizzy, a campaign creation assistant. The user wants to create a campaign: ${userInput}

Generate a campaign based on their request. Respond with JSON in this format:
{
  "id": "campaign_" + timestamp,
  "name": "Campaign Name",
  "objective": "Campaign objective description", 
  "status": "Draft",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "createdAt": current ISO timestamp
}

Make sure dates are realistic and the campaign aligns with their request.`

        const response = await spark.llm(prompt, undefined, true) // JSON mode
        
        try {
          const campaignData = JSON.parse(response)
          campaignData.id = `campaign_${Date.now()}`
          campaignData.createdAt = new Date().toISOString()
          
          // Persist the campaign
          await persistCampaign(campaignData)
          
          // Notify parent component
          if (onCampaignCreated) {
            onCampaignCreated(campaignData.id)
          }
          
          // Add assistant response to persistent chat
          await addAssistantMessage(`Great! I've created your campaign "${campaignData.name}". It's been saved as a draft and you can now edit it in the campaign editor.`)
          
          toast.success(`Campaign "${campaignData.name}" created successfully!`)
        } catch (parseError) {
          await addAssistantMessage("I had trouble creating that campaign. Could you try describing it differently?")
          toast.error("Failed to create campaign")
        }
      } else {
        // Use the global spark API for regular chat
        const prompt = spark.llmPrompt`You are Vizzy, a helpful AI marketing assistant. The user said: ${userInput}

Available commands:
- /create or "create campaign": Create a new campaign
- /simulate: Run campaign simulations
- /analyze: Analyze performance data
- /optimize: Suggest optimizations
- /status: Show current campaign status
- /explain: Explain marketing concepts

Context: This is a marketing analytics platform called Vizzy.
Provide a helpful, conversational response focused on marketing insights and actionable advice.`

        const response = await spark.llm(prompt)
        
        // Add assistant response to persistent chat
        await addAssistantMessage(response)
      }
    } catch (error) {
      console.error('Chat error:', error)
      await addAssistantMessage("Sorry, I'm having trouble responding right now. Please try again.")
      toast.error("Chat error occurred")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
            {error && (
              <div className="text-center text-red-500 py-2">
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Robot className="w-12 h-12 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">Hi! I'm Vizzy, your AI marketing assistant.</p>
                <p className="text-sm mt-2">Ask me to create campaigns, analyze data, or try commands like /explain or /status</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id || message.clientMsgId}
                  className={`flex gap-3 ${
                    message.author === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.author === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Robot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.author === "user" ? "order-first" : ""}`}>
                    <div
                      className={`p-3 rounded-lg ${
                        message.author === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      } ${message.pending ? "opacity-60" : ""}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content.text}</p>
                      {message.pending && (
                        <p className="text-xs mt-1 opacity-70">Sending...</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {toLocalHM(message.createdAt)}
                    </p>
                  </div>

                  {message.author === "user" && (
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

        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            placeholder="Ask Vizzy to create campaigns, analyze data, or use commands like /explain..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-h-[44px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            <PaperPlaneRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}