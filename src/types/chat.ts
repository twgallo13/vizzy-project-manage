/**
 * Chat Thread and Message Types
 * 
 * Persistent chat storage types that mirror the database schema
 * for stable message history across sessions and remounts.
 */

export interface ChatThread {
  id: string
  tenantId: string
  createdBy: string
  title?: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  threadId: string
  tenantId: string
  author: 'user' | 'assistant' | 'system'
  content: {
    text: string
    parts?: any[]
  }
  clientMsgId?: string
  createdAt: string
  deletedAt?: string
  // UI state (not persisted)
  pending?: boolean
}

export interface CreateThreadRequest {
  tenantId: string
  createdBy: string
  title?: string
}

export interface AppendMessageRequest {
  threadId: string
  tenantId: string
  author: 'user' | 'assistant' | 'system'
  content: {
    text: string
    parts?: any[]
  }
  clientMsgId: string
}

export interface ListMessagesRequest {
  threadId: string
  tenantId: string
  since?: string
}

export interface ChatMessageResponse {
  id: string
  idempotent: boolean
}