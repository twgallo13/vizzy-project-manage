import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PaperPlaneRight, Robot, User } from "@phosphor-icons/react"
import { useKV } from "@github/spark/hooks"

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
  const [messages, setMessages] = useKV<ChatMessage[]>("vizzy-chat-history", [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const mockCommands = ["/explain", "/simulate", "/whatif", "/set", "/export", "/status"]

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
      command: input.startsWith("/") ? input.split(" ")[0] : undefined
    }

    setMessages(prev => [...(prev || []), userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const prompt = spark.llmPrompt`You are Vizzy, an AI marketing assistant. The user said: "${input.trim()}"

Available commands:
- /explain: Explain marketing data and metrics
- /simulate: Run campaign simulations
- /whatif: Explore scenario planning
- /set: Set up campaigns or configurations
- /export: Export data in various formats
- /status: Show current campaign status

Context: This is a marketing analytics platform where users manage campaigns, analyze performance data, and get insights. Users can import CSV data, view KPIs like ROI (324%), active campaigns (23), and weekly reach (2.4M).

Provide a helpful, concise response as Vizzy. If it's a command, acknowledge it and explain what you can help with. Keep responses practical and actionable.`

      const response = await spark.llm(prompt, "gpt-4o-mini")
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...(prev || []), assistantMessage])
    } catch (error) {
      console.error("AI response error:", error)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...(prev || []), assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col sm:max-w-[95vw] sm:h-[90vh] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot className="w-5 h-5 text-primary" />
            Chat with Vizzy
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {mockCommands.map((command) => (
                <Button
                  key={command}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(command + " ")}
                  className="text-xs"
                >
                  {command}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {(!messages || messages.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  <Robot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-sm">Hi! I'm Vizzy, your marketing AI assistant.</p>
                  <p className="text-xs mt-1">Ask me about your campaigns, data, or use commands like /explain or /simulate</p>
                </div>
              )}
              
              {(messages || []).map((message) => (
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
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground ml-auto"
                        : "bg-muted"
                    }`}
                  >
                    {message.command && (
                      <div className="text-xs opacity-70 mb-1">
                        Command: {message.command}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Robot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-100" />
                      <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 pt-4 border-t">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Vizzy about your campaigns, data, or use /commands..."
              className="flex-1 min-h-[44px] max-h-32 resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              <PaperPlaneRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}