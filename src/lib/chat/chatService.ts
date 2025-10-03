/**
 * Chat Service Layer
 * 
 * High-level service methods for chat operations with business logic,
 * validation, and telemetry logging.
 */

import { 
  ChatThread, 
  ChatMessage, 
  CreateThreadRequest, 
  AppendMessageRequest, 
  ListMessagesRequest,
  ChatMessageResponse 
} from '../../types/chat'
import { 
  createThread as repoCreateThread,
  getThread,
  listMessages as repoListMessages,
  appendMessageIdempotent as repoAppendMessage,
  getActiveThreadId,
  setActiveThreadId
} from './chatRepo'

/**
 * Get default tenant ID for single-tenant frontend app
 */
export function getDefaultTenantId(): string {
  return 'default-tenant'
}

/**
 * Get default user ID
 */
export function getDefaultUserId(): string {
  return 'current-user'
}

/**
 * Create a new chat thread
 */
export function createThread(request?: Partial<CreateThreadRequest>): ChatThread {
  const fullRequest: CreateThreadRequest = {
    tenantId: request?.tenantId || getDefaultTenantId(),
    createdBy: request?.createdBy || getDefaultUserId(),
    title: request?.title
  }
  
  const thread = repoCreateThread(fullRequest)
  
  // Log telemetry
  console.log('chat.thread.created', {
    threadId: thread.id,
    tenantId: thread.tenantId,
    createdBy: thread.createdBy
  })
  
  return thread
}

/**
 * Get or create the active thread for the current tenant
 */
export function getOrCreateActiveThread(): ChatThread {
  const tenantId = getDefaultTenantId()
  const activeThreadId = getActiveThreadId(tenantId)
  
  if (activeThreadId) {
    const thread = getThread(activeThreadId, tenantId)
    if (thread) {
      return thread
    }
  }
  
  // Create new thread and set as active
  const newThread = createThread({ tenantId, createdBy: getDefaultUserId() })
  setActiveThreadId(tenantId, newThread.id)
  
  return newThread
}

/**
 * List messages for a thread
 */
export function listMessages(request: Partial<ListMessagesRequest>): ChatMessage[] {
  const fullRequest: ListMessagesRequest = {
    threadId: request.threadId || getOrCreateActiveThread().id,
    tenantId: request.tenantId || getDefaultTenantId(),
    since: request.since
  }
  
  const messages = repoListMessages(fullRequest)
  
  // Log telemetry
  console.log('chat.messages.load.count', {
    threadId: fullRequest.threadId,
    tenantId: fullRequest.tenantId,
    count: messages.length,
    since: fullRequest.since
  })
  
  return messages
}

/**
 * Append a message to a thread with idempotency
 */
export function appendMessage(request: Partial<AppendMessageRequest>): ChatMessageResponse {
  if (!request.content?.text) {
    throw new Error('Message content is required')
  }
  
  if (!request.clientMsgId) {
    throw new Error('Client message ID is required for idempotency')
  }
  
  const thread = getOrCreateActiveThread()
  
  const fullRequest: AppendMessageRequest = {
    threadId: request.threadId || thread.id,
    tenantId: request.tenantId || getDefaultTenantId(),
    author: request.author || 'user',
    content: request.content,
    clientMsgId: request.clientMsgId
  }
  
  const result = repoAppendMessage(fullRequest)
  
  // Log telemetry
  console.log('chat.message.created', {
    threadId: fullRequest.threadId,
    tenantId: fullRequest.tenantId,
    author: fullRequest.author,
    clientMsgId: fullRequest.clientMsgId,
    idempotent: result.idempotent,
    messageId: result.message.id
  })
  
  return {
    id: result.message.id,
    idempotent: result.idempotent
  }
}

/**
 * Generate a client message ID for idempotency
 */
export function generateClientMessageId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/**
 * Validate thread access for tenant
 */
export function validateThreadAccess(threadId: string, tenantId?: string): boolean {
  const thread = getThread(threadId, tenantId || getDefaultTenantId())
  return thread !== null
}