import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { PaperPlaneRight, Robot, User } from "@phosphor-icons/react"
import { useKV } from "@github/spark/hooks"

// Global spark API is available
declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
}

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

const mockCommands = ["/explain", "/simulate", "/set", "/whatif", "/export", "/status"]

export function VizzyChat({ open, onOpenChange }: VizzyChatProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useKV<ChatMessage[]>("vizzy-messages", [
    {
      id: "welcome",
      type: "assistant",
      content: "Hi! I'm Vizzy, your AI marketing assistant. I can help you explain data, simulate scenarios, set up campaigns, and more. Try typing a command like /explain or ask me anything about your marketing data!",
      timestamp: new Date()
    }
  ])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
      command: input.startsWith("/") ? input.split(" ")[0] : undefined
    }

    setMessages(prev => [...(prev || []), userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Use real AI with Spark API
      const prompt = spark.llmPrompt`You are Vizzy, an AI marketing assistant. You help users with marketing data analysis, campaign planning, and performance insights.

Context: You're helping with a marketing planning and analytics platform called Vizzy. Users can ask about campaigns, data analysis, or use specific commands.

Available commands:
- /explain: Explain marketing data and metrics
- /simulate: Run scenario simulations  
- /set: Set up campaigns or configurations
- /whatif: Explore what-if scenarios
- /export: Export data in various formats
- /status: Show current system status

User message: ${input}

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

  const getVizzyResponse = (input: string): string => {
    if (input.startsWith("/explain")) {
      return "I'll explain your marketing data in simple terms. What specific metric or campaign would you like me to break down?"
    }
    if (input.startsWith("/simulate")) {
      return "I can simulate different scenarios for you. What changes would you like to test? For example, budget adjustments, audience targeting, or campaign timing?"
    }
    if (input.startsWith("/set")) {
      return "I can help you set up new campaigns or modify existing ones. What would you like to configure?"
    }
    if (input.startsWith("/whatif")) {
      return "Great! Let's explore some what-if scenarios. What variable would you like to change and see the potential impact?"
    }
    if (input.startsWith("/export")) {
      return "I can export your data in various formats. Would you like XLSX for Wrike, CSV for analysis, or a summary report?"
    }
    if (input.startsWith("/status")) {
      return "Here's your current status: 23 active campaigns, 324% average ROI, 2.4M weekly reach. All systems operational!"
    }
    
    return "I understand you're asking about marketing data. Could you be more specific about what you'd like to know? You can also use commands like /explain, /simulate, or /whatif for structured assistance."
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
                  className="text-xs"
                  onClick={() => setInput(command + " ")}
                >
                  {command}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-4 pb-4">
              {messages?.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 sm:gap-3 ${
                    message.type === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.type === "assistant" && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Robot className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`min-w-0 max-w-[75%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-xs sm:text-sm break-words whitespace-pre-wrap overflow-wrap-anywhere hyphens-auto">{message.content}</div>
                    {message.command && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {message.command}
                      </Badge>
                    )}
                  </div>

                  {message.type === "user" && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Robot className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  </div>
                  <div className="bg-muted p-2 sm:p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message or command..."
              className="flex-1 min-w-0"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              size="sm"
              className="flex-shrink-0"
            >
              <PaperPlaneRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}