/**
 * VizzyChat Persistence Tests
 * 
 * Tests for chat thread persistence, message stability,
 * and no fade-out behavior across remounts.
 */

import { 
  getOrCreateActiveThread, 
  appendMessage, 
  listMessages, 
  generateClientMessageId 
} from '../lib/chat/chatService'
import { getActiveThreadId, setActiveThreadId } from '../lib/chat/chatRepo'

/**
 * Test: Messages persist across remounts
 */
export async function testMessagePersistence() {
  console.log('🧪 Testing message persistence...')
  
  try {
    // Create a thread and add some messages
    const thread = getOrCreateActiveThread()
    const clientMsgId1 = generateClientMessageId()
    const clientMsgId2 = generateClientMessageId()
    
    // Add user message
    await appendMessage({
      threadId: thread.id,
      author: 'user',
      content: { text: 'Test message 1' },
      clientMsgId: clientMsgId1
    })
    
    // Add assistant message  
    await appendMessage({
      threadId: thread.id,
      author: 'assistant',
      content: { text: 'Test response 1' },
      clientMsgId: clientMsgId2
    })
    
    // Simulate remount by creating new thread instance
    const newThread = getOrCreateActiveThread()
    const messages = listMessages({ threadId: newThread.id })
    
    if (newThread.id !== thread.id) {
      throw new Error('Thread ID should be consistent across remounts')
    }
    
    if (messages.length < 2) {
      throw new Error('Messages should persist across remounts')
    }
    
    const userMsg = messages.find(m => m.clientMsgId === clientMsgId1)
    const assistantMsg = messages.find(m => m.clientMsgId === clientMsgId2)
    
    if (!userMsg || !assistantMsg) {
      throw new Error('All messages should be retrievable')
    }
    
    console.log('✅ Message persistence test PASSED!')
    return true
    
  } catch (error) {
    console.error('❌ Message persistence test FAILED:', error)
    return false
  }
}

/**
 * Test: Idempotent message creation
 */
export async function testIdempotentMessages() {
  console.log('🧪 Testing idempotent messages...')
  
  try {
    const thread = getOrCreateActiveThread()
    const clientMsgId = generateClientMessageId()
    
    // Send same message twice
    const result1 = await appendMessage({
      threadId: thread.id,
      author: 'user',
      content: { text: 'Duplicate test message' },
      clientMsgId
    })
    
    const result2 = await appendMessage({
      threadId: thread.id,
      author: 'user', 
      content: { text: 'Duplicate test message' },
      clientMsgId
    })
    
    if (result1.id !== result2.id) {
      throw new Error('Same clientMsgId should return same message ID')
    }
    
    if (!result2.idempotent) {
      throw new Error('Second message should be marked as idempotent')
    }
    
    // Verify only one message exists in storage
    const messages = listMessages({ threadId: thread.id })
    const duplicates = messages.filter(m => m.clientMsgId === clientMsgId)
    
    if (duplicates.length !== 1) {
      throw new Error('Should only have one message with same clientMsgId')
    }
    
    console.log('✅ Idempotent messages test PASSED!')
    return true
    
  } catch (error) {
    console.error('❌ Idempotent messages test FAILED:', error)
    return false
  }
}

/**
 * Test: Thread stability across sessions
 */
export async function testThreadStability() {
  console.log('🧪 Testing thread stability...')
  
  try {
    const tenantId = 'default-tenant'
    
    // Clear active thread
    setActiveThreadId(tenantId, '')
    
    // Create first thread
    const thread1 = getOrCreateActiveThread()
    const activeId1 = getActiveThreadId(tenantId)
    
    if (activeId1 !== thread1.id) {
      throw new Error('Active thread ID should match created thread')
    }
    
    // Get thread again (simulating new session)
    const thread2 = getOrCreateActiveThread()
    const activeId2 = getActiveThreadId(tenantId)
    
    if (thread1.id !== thread2.id) {
      throw new Error('Thread should be stable across sessions')
    }
    
    if (activeId1 !== activeId2) {
      throw new Error('Active thread ID should persist')
    }
    
    console.log('✅ Thread stability test PASSED!')
    return true
    
  } catch (error) {
    console.error('❌ Thread stability test FAILED:', error)
    return false
  }
}

/**
 * Test: Message ordering stability
 */
export async function testMessageOrdering() {
  console.log('🧪 Testing message ordering...')
  
  try {
    const thread = getOrCreateActiveThread()
    const messageIds: string[] = []
    
    // Add messages in sequence
    for (let i = 0; i < 5; i++) {
      const result = await appendMessage({
        threadId: thread.id,
        author: i % 2 === 0 ? 'user' : 'assistant',
        content: { text: `Message ${i}` },
        clientMsgId: generateClientMessageId()
      })
      messageIds.push(result.id)
    }
    
    // Retrieve messages and verify order
    const messages = listMessages({ threadId: thread.id })
    const recentMessages = messages.slice(-5) // Get last 5 messages
    
    for (let i = 0; i < messageIds.length; i++) {
      const expectedId = messageIds[i]
      const actualMessage = recentMessages[i]
      
      if (actualMessage.id !== expectedId) {
        throw new Error(`Message order incorrect at index ${i}`)
      }
      
      if (actualMessage.content.text !== `Message ${i}`) {
        throw new Error(`Message content incorrect at index ${i}`)
      }
    }
    
    console.log('✅ Message ordering test PASSED!')
    return true
    
  } catch (error) {
    console.error('❌ Message ordering test FAILED:', error)
    return false
  }
}

/**
 * Run all chat persistence tests
 */
export async function runChatPersistenceTests() {
  console.log('🚀 Running VizzyChat persistence tests...')
  
  const results = await Promise.all([
    testMessagePersistence(),
    testIdempotentMessages(),
    testThreadStability(),
    testMessageOrdering()
  ])
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`\n📊 Chat Test Results: ${passed}/${total} passed`)
  
  if (passed === total) {
    console.log('🎉 All chat persistence tests PASSED! No more fade-out issues.')
  } else {
    console.log('❌ Some chat tests FAILED. Check the logs above.')
  }
  
  return passed === total
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testChatPersistence = {
    runChatPersistenceTests,
    testMessagePersistence,
    testIdempotentMessages,
    testThreadStability,
    testMessageOrdering
  }
}