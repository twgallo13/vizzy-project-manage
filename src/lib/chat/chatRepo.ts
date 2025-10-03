/**
 * Chat Persistence Repository
 * 
 * LocalStorage-based persistence that simulates database operations
 * with proper idempotency and normalization for chat threads/messages.
 */

import { ChatThread, ChatMessage, CreateThreadRequest, AppendMessageRequest, ListMessagesRequest } from '../../types/chat'

const CHAT_THREADS_KEY = 'vizzy:chat-threads'
const CHAT_MESSAGES_KEY = 'vizzy:chat-messages'

/**
 * Get all chat threads from localStorage
 */
export function getChatThreads(): ChatThread[] {
  try {
    const data = localStorage.getItem(CHAT_THREADS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.warn('Failed to parse chat threads:', error)
    return []
  }
}

/**
 * Save chat threads to localStorage
 */
export function saveChatThreads(threads: ChatThread[]): void {
  try {
    localStorage.setItem(CHAT_THREADS_KEY, JSON.stringify(threads))
  } catch (error) {
    console.error('Failed to save chat threads:', error)
    throw new Error('Failed to persist chat threads')
  }
}

/**
 * Get all chat messages from localStorage
 */
export function getChatMessages(): ChatMessage[] {
  try {
    const data = localStorage.getItem(CHAT_MESSAGES_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.warn('Failed to parse chat messages:', error)
    return []
  }
}

/**
 * Save chat messages to localStorage
 */
export function saveChatMessages(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages))
  } catch (error) {
    console.error('Failed to save chat messages:', error)
    throw new Error('Failed to persist chat messages')
  }
}

/**
 * Create a new chat thread
 */
export function createThread(request: CreateThreadRequest): ChatThread {
  const threads = getChatThreads()
  
  const newThread: ChatThread = {
    id: `thread_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    tenantId: request.tenantId,
    createdBy: request.createdBy,
    title: request.title,
    createdAt: new Date().toISOString()
  }
  
  threads.push(newThread)
  saveChatThreads(threads)
  
  return newThread
}

/**
 * Get thread by ID with tenant validation
 */
export function getThread(threadId: string, tenantId: string): ChatThread | null {
  const threads = getChatThreads()
  return threads.find(t => t.id === threadId && t.tenantId === tenantId) || null
}

/**
 * List messages for a thread with optional since filter
 */
export function listMessages(request: ListMessagesRequest): ChatMessage[] {
  const messages = getChatMessages()
  let filtered = messages.filter(m => 
    m.threadId === request.threadId && 
    m.tenantId === request.tenantId &&
    !m.deletedAt
  )
  
  if (request.since) {
    filtered = filtered.filter(m => m.createdAt > request.since!)
  }
  
  return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

/**
 * Append message with idempotency via clientMsgId
 */
export function appendMessageIdempotent(request: AppendMessageRequest): { message: ChatMessage; idempotent: boolean } {
  const messages = getChatMessages()
  
  // Check for existing message with same clientMsgId
  const existing = messages.find(m => 
    m.threadId === request.threadId && 
    m.clientMsgId === request.clientMsgId &&
    !m.deletedAt
  )
  
  if (existing) {
    return { message: existing, idempotent: true }
  }
  
  // Create new message
  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    threadId: request.threadId,
    tenantId: request.tenantId,
    author: request.author,
    content: request.content,
    clientMsgId: request.clientMsgId,
    createdAt: new Date().toISOString()
  }
  
  messages.push(newMessage)
  saveChatMessages(messages)
  
  return { message: newMessage, idempotent: false }
}

/**
 * Get the current tenant's active thread ID from localStorage
 */
export function getActiveThreadId(tenantId: string): string | null {
  try {
    const key = `vizzy:active-thread:${tenantId}`
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Set the current tenant's active thread ID in localStorage
 */
export function setActiveThreadId(tenantId: string, threadId: string): void {
  try {
    const key = `vizzy:active-thread:${tenantId}`
    localStorage.setItem(key, threadId)
  } catch (error) {
    console.warn('Failed to save active thread ID:', error)
  }
}

/**
 * Clean up old messages (housekeeping)
 */
export function cleanupOldMessages(daysOld: number = 30): number {
  const messages = getChatMessages()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const filtered = messages.filter(m => new Date(m.createdAt) > cutoffDate)
  const removedCount = messages.length - filtered.length
  
  if (removedCount > 0) {
    saveChatMessages(filtered)
  }
  
  return removedCount
}