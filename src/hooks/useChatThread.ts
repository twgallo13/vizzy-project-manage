/**
 * Chat Thread React Hook
 * 
 * Manages chat thread lifecycle, message loading, and stable state
 * across component remounts with proper idempotency.
 */

import { useState, useEffect, useCallback } from 'react'
import { ChatMessage } from '../types/chat'
import { 
  getOrCreateActiveThread, 
  listMessages, 
  appendMessage, 
  generateClientMessageId 
} from '../lib/chat/chatService'

interface UseChatThreadOptions {
  autoLoad?: boolean
  threadId?: string
}

interface UseChatThreadReturn {
  threadId: string
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  refreshMessages: () => Promise<void>
}

/**
 * Hook for managing a chat thread with persistent storage
 */
export function useChatThread(options: UseChatThreadOptions = {}): UseChatThreadReturn {
  const { autoLoad = true } = options
  
  const [threadId, setThreadId] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize thread
  useEffect(() => {
    if (!autoLoad) return
    
    try {
      const thread = getOrCreateActiveThread()
      setThreadId(thread.id)
    } catch (err) {
      console.error('Failed to initialize chat thread:', err)
      setError('Failed to initialize chat')
    }
  }, [autoLoad])
  
  // Load messages when thread is ready
  const refreshMessages = useCallback(async () => {
    if (!threadId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const loadedMessages = listMessages({ threadId })
      setMessages(loadedMessages)
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [threadId])
  
  // Load messages when thread changes
  useEffect(() => {
    if (threadId && autoLoad) {
      refreshMessages()
    }
  }, [threadId, autoLoad, refreshMessages])
  
  // Send message with optimistic updates and idempotency
  const sendMessage = useCallback(async (content: string) => {
    if (!threadId || !content.trim()) return
    
    const clientMsgId = generateClientMessageId()
    
    // Optimistic update - add pending message
    const optimisticMessage: ChatMessage = {
      id: clientMsgId, // Temporary ID
      threadId,
      tenantId: 'default-tenant',
      author: 'user',
      content: { text: content.trim() },
      clientMsgId,
      createdAt: new Date().toISOString(),
      pending: true
    }
    
    setMessages(prev => [...prev, optimisticMessage])
    
    try {
      // Send message to service
      const result = await appendMessage({
        threadId,
        author: 'user',
        content: { text: content.trim() },
        clientMsgId
      })
      
      // Replace optimistic message with server response
      setMessages(prev => prev.map(msg => {
        if (msg.clientMsgId === clientMsgId && msg.pending) {
          return {
            ...msg,
            id: result.id,
            pending: false
          }
        }
        return msg
      }))
      
    } catch (err) {
      console.error('Failed to send message:', err)
      // Remove failed optimistic message
      setMessages(prev => prev.filter(msg => msg.clientMsgId !== clientMsgId))
      setError('Failed to send message')
      throw err
    }
  }, [threadId])
  
  return {
    threadId,
    messages,
    isLoading,
    error,
    sendMessage,
    refreshMessages
  }
}

/**
 * Hook for adding assistant responses to the chat
 */
export function useAssistantResponse(threadId: string) {
  const addAssistantMessage = useCallback(async (content: string) => {
    if (!threadId || !content.trim()) return
    
    const clientMsgId = generateClientMessageId()
    
    try {
      const result = await appendMessage({
        threadId,
        author: 'assistant',
        content: { text: content.trim() },
        clientMsgId
      })
      
      return result.id
    } catch (err) {
      console.error('Failed to add assistant message:', err)
      throw err
    }
  }, [threadId])
  
  return { addAssistantMessage }
}